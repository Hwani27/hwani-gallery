import{aG as e}from"./index-CyHZSl6b.js";async function s(r){let a="";try{a=await e.createLink({path:"intoss://byeoljaguk"})}catch{a=""}const t=a?`${r}
${a}`:r;try{return await e.sendMessage({message:t}),"toss"}catch{}try{if(navigator.share)return await navigator.share({text:t}),"native"}catch{}try{return await navigator.clipboard.writeText(t),"copied"}catch{return"failed"}}export{s};
