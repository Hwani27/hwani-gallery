#!/usr/bin/env python3
"""glb-opt.py - shrink a CC0 character GLB/glTF for the web.

Keeps only the animation clips you ask for, drops named nodes (and the meshes
only they used), embeds external textures, downsizes every texture to a max
edge, and rewrites the file as a single self-contained .glb.

Usage:
  python3 tools/glb-opt.py --in Warrior.gltf --out Warrior.glb \
      --keep Idle,Walk,Run,Punch,Sword_Attack,RecieveHit,Death,Roll \
      --tex-max 512 [--drop-node Name ...]

Input may be .glb or .gltf (buffers/images either embedded as data URIs or
sitting next to the file). No external tools needed.
"""
import argparse
import base64
import io
import json
import os
import struct
import sys

GLB_MAGIC = 0x46546C67
CHUNK_JSON = 0x4E4F534A
CHUNK_BIN = 0x004E4942


def read_glb(path):
    data = open(path, 'rb').read()
    magic, version, length = struct.unpack('<III', data[:12])
    assert magic == GLB_MAGIC, 'not a GLB'
    off, js, bin_ = 12, None, bytearray()
    while off < length:
        clen, ctype = struct.unpack('<II', data[off:off + 8])
        chunk = data[off + 8: off + 8 + clen]
        off += 8 + clen
        if ctype == CHUNK_JSON:
            js = json.loads(chunk.decode('utf-8'))
        elif ctype == CHUNK_BIN:
            bin_ = bytearray(chunk)
    return js, bin_


def read_gltf(path):
    js = json.load(open(path, encoding='utf-8'))
    base = os.path.dirname(os.path.abspath(path))
    buf = bytearray()
    for b in js.get('buffers', []):
        uri = b.get('uri')
        if uri is None:
            continue
        if uri.startswith('data:'):
            buf += base64.b64decode(uri.split(',', 1)[1])
        else:
            buf += open(os.path.join(base, uri), 'rb').read()
    return js, buf


def write_glb(path, js, bin_):
    jb = json.dumps(js, separators=(',', ':')).encode('utf-8')
    jb += b' ' * ((4 - len(jb) % 4) % 4)
    bb = bytes(bin_)
    bb += b'\x00' * ((4 - len(bb) % 4) % 4)
    total = 12 + 8 + len(jb) + (8 + len(bb) if bb else 0)
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', GLB_MAGIC, 2, total))
        f.write(struct.pack('<II', len(jb), CHUNK_JSON))
        f.write(jb)
        if bb:
            f.write(struct.pack('<II', len(bb), CHUNK_BIN))
            f.write(bb)


def accessor_bytes(js, bin_, idx):
    acc = js['accessors'][idx]
    if 'bufferView' not in acc:
        return b''
    bv = js['bufferViews'][acc['bufferView']]
    start = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    comp = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}[acc['componentType']]
    ncomp = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT2': 4, 'MAT3': 9, 'MAT4': 16}[acc['type']]
    if 'byteStride' in bv:
        stride = bv['byteStride']
    else:
        stride = comp * ncomp
    need = stride * (acc['count'] - 1) + comp * ncomp if acc['count'] else 0
    return bin_[start:start + max(need, comp * ncomp)]


def accessor_max_time(js, bin_, idx):
    acc = js['accessors'][idx]
    if 'max' in acc:
        return float(acc['max'][0])
    raw = accessor_bytes(js, bin_, idx)
    import array
    a = array.array('f')
    a.frombytes(raw)
    return max(a) if a else 0.0


def drop_nodes(js, names):
    """Remove nodes by name (and their mesh), reindexing everything."""
    names = set(names)
    if not names:
        return
    keep = [i for i, n in enumerate(js['nodes']) if n.get('name') not in names]
    if len(keep) == len(js['nodes']):
        return
    dropped = {i for i in range(len(js['nodes'])) if i not in set(keep)}
    remap = {old: new for new, old in enumerate(keep)}
    nodes = []
    for i in keep:
        n = dict(js['nodes'][i])
        if 'children' in n:
            n['children'] = [remap[c] for c in n['children'] if c in remap]
        if 'skin' in n and 'mesh' in n:
            pass
        nodes.append(n)
    js['nodes'] = nodes
    for sc in js.get('scenes', []):
        if 'nodes' in sc:
            sc['nodes'] = [remap[c] for c in sc['nodes'] if c in remap]
    for sk in js.get('skins', []):
        sk['joints'] = [remap[j] for j in sk['joints'] if j in remap]
        if 'skeleton' in sk and sk['skeleton'] not in remap:
            sk.pop('skeleton')
    # animation channels point at nodes by index: remap or drop them
    for an in js.get('animations', []):
        chans = []
        for ch in an['channels']:
            t = ch.get('target', {})
            if 'node' in t:
                if t['node'] not in remap:
                    continue
                t['node'] = remap[t['node']]
            chans.append(ch)
        an['channels'] = chans
        used = {ch['sampler'] for ch in chans}
        smap = {}
        samplers = []
        for si, sm in enumerate(an['samplers']):
            if si in used:
                smap[si] = len(samplers)
                samplers.append(sm)
        an['samplers'] = samplers
        for ch in an['channels']:
            ch['sampler'] = smap[ch['sampler']]
    # meshes that no remaining node uses are unreachable: drop them
    used = {n['mesh'] for n in js['nodes'] if 'mesh' in n}
    mmap = {}
    meshes = []
    for i, m in enumerate(js.get('meshes', [])):
        if i in used:
            mmap[i] = len(meshes)
            meshes.append(m)
    js['meshes'] = meshes
    for n in js['nodes']:
        if 'mesh' in n:
            n['mesh'] = mmap[n['mesh']]


def prune_animations(js, bin_, keep_names):
    anims = js.get('animations', [])
    if not keep_names:
        return 0
    kept, missing = [], []
    for name in keep_names:
        hit = None
        for a in anims:
            if (a.get('name') or '').lower() == name.lower():
                hit = a
                break
        if hit is None:
            missing.append(name)
        else:
            kept.append(hit)
    if missing:
        print('  ! clips not found:', ', '.join(missing), file=sys.stderr)
    js['animations'] = kept
    return len(kept)


def embed_and_resize_images(js, bin_, base_dir, tex_max):
    from PIL import Image
    for img in js.get('images', []):
        raw = None
        mime = img.get('mimeType', 'image/png')
        if 'bufferView' in img:
            bv = js['bufferViews'][img['bufferView']]
            s = bv.get('byteOffset', 0)
            raw = bin_[s:s + bv['byteLength']]
        elif img.get('uri', '').startswith('data:'):
            raw = base64.b64decode(img['uri'].split(',', 1)[1])
        elif img.get('uri'):
            raw = open(os.path.join(base_dir, img['uri']), 'rb').read()
        if raw is None:
            continue
        try:
            im = Image.open(io.BytesIO(raw)).convert('RGBA')
        except Exception as e:
            print('  ! image decode failed:', e, file=sys.stderr)
            continue
        w, h = im.size
        if tex_max and max(w, h) > tex_max:
            k = tex_max / float(max(w, h))
            im = im.resize((max(1, int(w * k)), max(1, int(h * k))), Image.LANCZOS)
        out = io.BytesIO()
        im.save(out, 'PNG', optimize=True)
        data = out.getvalue()
        bv = {'buffer': 0, 'byteOffset': len(bin_)}
        pad = (4 - len(bin_) % 4) % 4
        bin_ += b'\x00' * pad
        bv['byteOffset'] = len(bin_)
        bin_ += data
        bv['byteLength'] = len(data)
        js['bufferViews'].append(bv)
        img.pop('uri', None)
        img['bufferView'] = len(js['bufferViews']) - 1
        img['mimeType'] = 'image/png'
        print('  texture %s: %dx%d -> %s (%d bytes)' % (img.get('name', '?'), w, h, im.size, len(data)))
    return bin_


def rebuild(js, bin_, keep_names):
    prune_animations(js, bin_, keep_names)
    used_acc = set()
    for a in js.get('animations', []):
        for sm in a['samplers']:
            used_acc.add(sm['input'])
            used_acc.add(sm['output'])
    for m in js.get('meshes', []):
        for p in m.get('primitives', []):
            for idx in p.get('attributes', {}).values():
                used_acc.add(idx)
            if 'indices' in p:
                used_acc.add(p['indices'])
            for t in p.get('targets', []) or []:
                for idx in t.values():
                    used_acc.add(idx)
    for sk in js.get('skins', []):
        if 'inverseBindMatrices' in sk:
            used_acc.add(sk['inverseBindMatrices'])
    accs = js.get('accessors', [])
    used_acc = {i for i in used_acc if 0 <= i < len(accs)}
    # bufferViews kept: those used by kept accessors + images
    keep_bv = {}
    for ai in sorted(used_acc):
        if 'bufferView' in accs[ai]:
            keep_bv[accs[ai]['bufferView']] = None
    for img in js.get('images', []):
        if 'bufferView' in img:
            keep_bv[img['bufferView']] = None
    new_bin = bytearray()
    bvmap = {}
    new_bvs = []
    for old in sorted(keep_bv):
        bv = dict(js['bufferViews'][old])
        start = bv.get('byteOffset', 0)
        chunk = bin_[start:start + bv['byteLength']]
        pad = (4 - len(new_bin) % 4) % 4
        new_bin += b'\x00' * pad
        bv['byteOffset'] = len(new_bin)
        new_bin += chunk
        bv['buffer'] = 0
        bvmap[old] = len(new_bvs)
        new_bvs.append(bv)
    js['bufferViews'] = new_bvs
    new_accs, amap = [], {}
    for ai in sorted(used_acc):
        acc = dict(accs[ai])
        if 'bufferView' in acc:
            acc['bufferView'] = bvmap[acc['bufferView']]
        new_accs.append(acc)
        amap[ai] = len(new_accs) - 1
    js['accessors'] = new_accs
    for a in js.get('animations', []):
        for sm in a['samplers']:
            sm['input'] = amap[sm['input']]
            sm['output'] = amap[sm['output']]
    for m in js.get('meshes', []):
        for p in m.get('primitives', []):
            p['attributes'] = {k: amap[v] for k, v in p['attributes'].items()}
            if 'indices' in p:
                p['indices'] = amap[p['indices']]
            if p.get('targets'):
                p['targets'] = [{k: amap[v] for k, v in t.items()} for t in p['targets']]
    for sk in js.get('skins', []):
        if 'inverseBindMatrices' in sk:
            sk['inverseBindMatrices'] = amap[sk['inverseBindMatrices']]
    for img in js.get('images', []):
        if 'bufferView' in img:
            img['bufferView'] = bvmap[img['bufferView']]
    # drop empty animations (no clips kept) but keep key
    js['buffers'] = [{'byteLength': len(new_bin)}]
    return js, new_bin


def strip_tex_transform(js):
    """Drop KHR_texture_transform when it only restates texCoord 0 (three r128
    cannot apply non-zero UV sets anyway, and the default is a no-op)."""
    changed = False
    for m in js.get('materials', []):
        for holder in [m.get('pbrMetallicRoughness', {})] + [m]:
            for key in ('baseColorTexture', 'metallicRoughnessTexture', 'normalTexture',
                        'occlusionTexture', 'emissiveTexture'):
                if key in holder:
                    tex = holder[key]
                    ext = tex.get('extensions', {})
                    tt = ext.get('KHR_texture_transform')
                    if tt is not None:
                        if tt.get('texCoord', 0) == 0 and 'offset' not in tt and 'scale' not in tt and 'rotation' not in tt:
                            ext.pop('KHR_texture_transform', None)
                            if not ext:
                                tex.pop('extensions', None)
                            changed = True
                        elif tt.get('texCoord', 0) != 0:
                            print('  ! KHR_texture_transform uses UV set %s on %s (three r128 cannot apply it)'
                                  % (tt.get('texCoord'), key), file=sys.stderr)
    if changed and 'extensionsUsed' in js:
        js['extensionsUsed'] = [e for e in js['extensionsUsed'] if e != 'KHR_texture_transform']
        if not js['extensionsUsed']:
            js.pop('extensionsUsed')


def strip_unlit(js):
    for m in js.get('materials', []):
        ext = m.get('extensions', {})
        ext.pop('KHR_materials_unlit', None)
        if not ext:
            m.pop('extensions', None)
        pbr = m.setdefault('pbrMetallicRoughness', {})
        pbr.setdefault('metallicFactor', 0.0)
        pbr.setdefault('roughnessFactor', 0.85)
    if 'extensionsUsed' in js:
        js['extensionsUsed'] = [e for e in js['extensionsUsed'] if e != 'KHR_materials_unlit']
        if not js['extensionsUsed']:
            js.pop('extensionsUsed')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='src', required=True)
    ap.add_argument('--out', dest='dst', required=True)
    ap.add_argument('--keep', default='')
    ap.add_argument('--drop-node', action='append', default=[])
    ap.add_argument('--tex-max', type=int, default=512)
    ap.add_argument('--strip-unlit', action='store_true')
    ap.add_argument('--strip-tex-transform', action='store_true')
    a = ap.parse_args()
    src = a.src
    if src.lower().endswith('.glb'):
        js, bin_ = read_glb(src)
        base = os.path.dirname(os.path.abspath(src))
    else:
        js, bin_ = read_gltf(src)
        base = os.path.dirname(os.path.abspath(src))
    print('in:', src, 'anims', len(js.get('animations', [])), 'nodes', len(js['nodes']),
          'meshes', len(js.get('meshes', [])), 'json', len(json.dumps(js)), 'bin', len(bin_))
    drop_nodes(js, a.drop_node)
    if a.strip_unlit:
        strip_unlit(js)
    if a.strip_tex_transform:
        strip_tex_transform(js)
    bin_ = embed_and_resize_images(js, bin_, base, a.tex_max)
    keep = [s for s in a.keep.split(',') if s]
    js, bin_ = rebuild(js, bin_, keep)
    js.pop('buffers', None)
    js['buffers'] = [{'byteLength': len(bin_)}]
    js['asset'] = {'version': '2.0', 'generator': 'glb-opt (hwani-gallery)'}
    write_glb(a.dst, js, bin_)
    out = os.path.getsize(a.dst)
    print('out:', a.dst, out, 'bytes; clips:', [c.get('name') for c in js.get('animations', [])])
    for c in js.get('animations', []):
        n = 0
        for sm in c['samplers']:
            n = max(n, accessor_max_time(js, bin_, sm['input']))
        print('   %-34s %.2fs' % (c.get('name'), n))


if __name__ == '__main__':
    main()
