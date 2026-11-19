"""Make a standalone page for one game of the board-games collection.
usage: python3 split.py <board-games/index.html> <game id> <title> <out.html> [--strip]"""
import re, sys
src, gid, title, out = sys.argv[1:5]
strip = '--strip' in sys.argv
s = open(src, encoding='utf-8').read()
s = re.sub(r'<link[^>]*rel="manifest"[^>]*>', '', s)   # the collection's PWA manifest doesn't apply here
s = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', s, count=1, flags=re.S)
if strip:
    # board-game engines this game never touches (each <script> starts with its banner comment)
    for banner in ['/* ================= OMOK =', '/* ================= JANGGI', '/* ===== Baduk engine', '/* ================= UNO =', '/* ===== Chess engine (runs inside the worker)']:
        i = s.find(banner); 
        if i < 0: continue
        a = s.rfind('<script>', 0, i); b = s.find('</script>', i) + len('</script>')
        s = s[:a] + '<script>/* removed: ' + banner.strip('/* =') + ' */</script>' + s[b:]
boot = f"""<script>
/* standalone: open {gid} directly; leaving the game returns to the gallery */
(function(){{var G={gid!r};document.documentElement.classList.add('split-'+G);
  window.backToLauncher=function(){{location.href='../';}};
  function boot(){{try{{window.openGame(G);}}catch(e){{return setTimeout(boot,120);}}}}
  if(document.readyState==='complete')setTimeout(boot,60);else addEventListener('load',function(){{setTimeout(boot,60);}});
}})();</script>
<style>#launcher{{display:none!important}}</style>
"""
i = s.rfind('</body>')
s = s[:i] + boot + s[i:] if i >= 0 else s + boot
open(out, 'w', encoding='utf-8').write(s)
print(out, round(len(s.encode()) / 1e6, 2), 'MB')
