import('./main.jsx').then(()=>{
  const findField=labelText=>[...document.querySelectorAll('.field')].find(el=>el.querySelector('label')?.textContent?.trim()===labelText);
  const patch=()=>{
    const track=findField('Track');
    const defect=findField('Defect');
    if(track&&defect&&track!==defect&&track.previousElementSibling!==defect)defect.after(track);
    if(track&&!track.dataset.defaultApplied){
      const editing=document.body.innerText.includes('Edit the saved quality record.');
      const select=track.querySelector('select');
      if(!editing&&select&&select.value!=='NA'){
        select.value='NA';
        select.dispatchEvent(new Event('change',{bubbles:true}));
      }
      track.dataset.defaultApplied='1';
    }
  };
  patch();
  new MutationObserver(patch).observe(document.getElementById('root'),{subtree:true,childList:true});
});
