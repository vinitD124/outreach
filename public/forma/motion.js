/* FORMA — native-scroll choreography. No wheel/touch interception. */
(() => {
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 /* One source of truth for the name: the header mark, which is what
    the renderer personalises. */
 const BRAND=((document.querySelector('.brand')||{}).textContent||'FORMA').replace(/®/g,'').trim();
 const PLACE=((document.querySelector('.hero-top [data-req="address"]')||{}).textContent||'').trim();
 const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
 let procStep=-1,procShow=()=>{},hovering=false;
 const mq=matchMedia('(prefers-reduced-motion: reduce)');
 let enabled=!mq.matches,frame=0,layout=[],lastY=0;
 const controls=document.createElement('div');controls.className='experience-controls';controls.innerHTML='<span class="chapter-name">01 / INTRODUCTION</span><button class="motion-toggle" type="button" aria-pressed="false">Motion on <span>◉</span></button><span class="reading-progress" aria-hidden="true"><i></i></span>';document.body.append(controls);
 const curtain=document.createElement('div');curtain.className='page-curtain';curtain.setAttribute('aria-hidden','true');curtain.innerHTML='<span>'+BRAND+'<sup>®</sup></span>';document.body.append(curtain);
 const cursor=document.createElement('div');cursor.className='project-cursor';cursor.setAttribute('aria-hidden','true');cursor.textContent='EXPLORE ↗';document.body.append(cursor);
 const home=!!$('.hero');
 function wrap(el,name){const shell=document.createElement('div');shell.className=name;el.before(shell);shell.append(el);return shell}
 let heroScene,projectScene,aboutScene;
 if(home){
  heroScene=wrap($('.hero'),'hero-scene');
  const hero=$('.hero');hero.innerHTML=`<img class="portal-image" src="assets/hero.jpg" alt="Sculptural architecture in timber and stone" fetchpriority="high"><div class="portal-vignette"></div><span class="pt-dock" aria-hidden="true"></span><div class="hero-editorial"><span>ARCHITECTURE IS AN EXPERIENCE.</span><span>INDEPENDENT STUDIO<br>'+PLACE+'</span></div><h1 class="portal-title"><span class="pt-a">A different</span><span class="pt-b"><span class="pt-pre">sense of&nbsp;</span><em class="pt-anchor">space<span class="pt-become" aria-hidden="true">is a feeling<i class="pt-mark">.</i></span></em><span class="pt-dot">.</span></span></h1><div class="portal-side portal-left"><img src="assets/detail.jpg" alt="Concrete and furniture detail"><span>01 / MATTER</span></div><div class="portal-side portal-right"><img src="assets/architecture.jpg" alt="Architectural light and shadow"><span>02 / LIGHT</span></div><div class="portal-caption"><span>THE QUIET RESIDENCE</span><span>INDEPENDENT BY DESIGN</span></div><a class="portal-enter" href="#projects">Enter our world <span>↗</span></a><span class="scroll-cue">SCROLL TO FEEL <i>↓</i></span><div class="hero-bottom"><span>SPACES FOR A LIFE WELL LIVED.</span><span class="portal-count">VOL. 01 — SELECTED WORKS</span></div>`;
  const statement=$('.intro h2');statement.classList.remove('reveal');statement.innerHTML='<span class="statement-word">Good</span> <span class="statement-word">spaces</span> <span class="statement-word">are</span> <span class="statement-word">seen.</span><br><span class="statement-word">Great</span> <span class="statement-word">spaces</span> <span class="statement-word">are</span> <em class="statement-word">felt.</em>';
  const project=$('#projects');const top=document.createElement('div');top.className='project-stage';while(project.firstChild)top.append(project.firstChild);project.append(top);projectScene=project;
  const grid=$('.project-grid');grid.classList.add('project-track');$$('.project').forEach((p,i)=>{p.classList.add('project-panel');p.querySelector('.image-wrap').insertAdjacentHTML('beforeend',`<span class="project-giant" aria-hidden="true">0${i+1}</span>`);p.querySelector('.project-caption')?.remove();p.dataset.cursor='EXPLORE ↗';});
  top.insertAdjacentHTML('beforeend','<div class="gallery-controls"><span>SELECTED SPACES</span><div class="gallery-dots" aria-label="Jump to a project">'+$$('.project').map((p,i)=>`<button aria-label="Show ${p.querySelector('h3').textContent}" data-project-index="${i}">0${i+1}</button>`).join('')+'</div><span class="gallery-direction">SCROLL TO DISCOVER →</span></div>');
  $$('.gallery-dots button').forEach(b=>b.addEventListener('click',()=>{const index=+b.dataset.projectIndex;if(isWide()&&enabled){const box=project.getBoundingClientRect();const fraction=index/3;window.scrollTo({top:scrollY+box.top+(project.offsetHeight-innerHeight)*fraction,behavior:enabled?'smooth':'instant'})}else{$$('.project')[index].scrollIntoView({behavior:enabled?'smooth':'instant',block:'center'})}}));
  aboutScene=wrap($('.philosophy'),'material-scene');$('.philosophy').insertAdjacentHTML('beforeend','<div class="material-type" aria-hidden="true"><span>LESS.</span><span>BUT BETTER.</span></div><span class="material-label" aria-hidden="true">MATERIAL / LIGHT / EMOTION</span>');
  /* The preview follows the stage you are reading: pointer on a wide
     screen, and otherwise whichever step sits nearest the middle of the
     viewport, so the card still means something on a phone. */
  {
   const steps=$$('.process .step');
   const show=i=>{if(i<0||i===procStep)return;procStep=i;
     steps.forEach((s,j)=>s.classList.toggle('step-active',j===i));
     dispatchEvent(new CustomEvent('forma:stage',{detail:i}))};
   const list=$('.process');
   steps.forEach((s,i)=>{s.addEventListener('pointerenter',()=>{if(matchMedia('(hover:hover)').matches){hovering=true;show(i)}});
     s.addEventListener('focusin',()=>show(i))});
   list&&list.addEventListener('pointerleave',()=>{hovering=false});
   addEventListener('scroll',()=>{hovering=false},{passive:true});
   procShow=show;show(0)}
  $$('.journal-card').forEach((card,i)=>{card.style.setProperty('--card-index',i);card.dataset.cursor='READ ↗'});
  /* Split into words so the philosophy copy can fill on scroll the
     way the studio statement does. Recursive so the italic survives and
     the line break is left alone. */
  const splitWords=(node)=>{[...node.childNodes].forEach(n=>{
    if(n.nodeType===3){const frag=document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(!t.trim()){frag.append(t);return}
        const w=document.createElement('span');w.className='fill-word';w.textContent=t;frag.append(w)});
      n.replaceWith(frag);}
    else if(n.nodeType===1&&n.tagName!=='BR'){splitWords(n)}})};
  const philo=$('.philosophy-content');
  if(philo){philo.querySelector('h2')?.classList.remove('reveal');
    philo.querySelectorAll('h2,p').forEach(splitWords)}
  $('.contact-heading').insertAdjacentHTML('beforeend','<span class="contact-orbit" aria-hidden="true">LET’S MAKE ROOM FOR SOMETHING EXTRAORDINARY.</span>');
 }
 function isWide(){return innerWidth>900&&innerHeight>560}
 /* Where the surviving word ends up. Measured against an invisible dock
    rather than guessed, so it lands on the page margin at any width. The
    anchor's own transform is cleared first or we would measure the
    distance it has already travelled. */
 const travel={x:0,y:0,s:.7};
 function measureTravel(){const a=$('.pt-anchor'),d=$('.pt-dock'),hero=$('.hero'),b=$('.pt-become');if(!a||!d||!hero||!b)return;
  a.style.transform='none';void a.offsetWidth;
  const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect(),dr=d.getBoundingClientRect(),hr=hero.getBoundingClientRect();
  /* The whole phrase has to sit on one line, so the scale is derived from
     how wide it actually is rather than set to a number that happens to
     suit one screen. Narrow viewports shrink it more; nothing wraps. */
  const wide=ar.width+br.width,cap=parseFloat(getComputedStyle(hero).getPropertyValue('--dock-max'))||.8;
  travel.s=Math.min(cap,(hr.width*(parseFloat(getComputedStyle(hero).getPropertyValue('--dock-fit'))||.86))/Math.max(1,wide));
  travel.x=(hr.left+(hr.width-wide*travel.s)/2)-ar.left;
  travel.y=dr.top-ar.top}
 function measure(){layout=[];measureTravel();const add=(el,type)=>{if(el)layout.push({el,type,top:el.getBoundingClientRect().top+scrollY,height:el.offsetHeight})};add(heroScene,'hero');add($('.intro'),'intro');add(projectScene,'projects');add(aboutScene,'material');add($('.services'),'services');add($('.journal'),'journal');add($('.contact'),'contact');add($('.detail-hero'),'detail');add($('.detail-full'),'detailImage');schedule()}
 function set(el,prop,value){if(el)el.style.setProperty(prop,value)}
 function update(){frame=0;const y=scrollY,h=innerHeight;const wide=isWide();set($('.reading-progress i'),'transform',`scaleX(${clamp(y/(document.documentElement.scrollHeight-h||1))})`);let chapter='01 / INTRODUCTION';
  if(enabled)for(const s of layout){const {el,type,top,height}=s;const view=(y+h-top)/(h+height), p=clamp((y-top)/Math.max(1,height-h));if(y+h<top||y>top+height)continue;
   if(type==='hero'){const t=clamp((y-top)/Math.max(1,height-h));set(el,'--hero-p',t);set($('.hero'),'--portal-open',t);set(document.documentElement,'--portal-open',t);document.body.classList.toggle('hero-dimmed',t>.26);set($('.hero>img'),'transform',`scale(${1+t*.08})`);const shed=clamp((t-.26)/.14),become=clamp((t-.62)/.2);
    /* The word leaves the sentence and walks to the margin. Easing it
       rather than running it linear is what makes it read as a decision
       instead of a slide. */
    const g=clamp((t-.30)/.30),ease=g*g*(3-2*g);
    $$('.pt-a,.pt-pre,.pt-dot').forEach((e,i)=>{set(e,'opacity',1-clamp(shed*(1+i*.2)));set(e,'transform',`translateY(${shed*(20+i*8)}px)`)});
    set($('.pt-anchor'),'transform',`translate(${travel.x*ease}px,${travel.y*ease}px) scale(${1-ease*(1-travel.s)})`);
    set($('.pt-become'),'opacity',become);set($('.pt-become'),'clip-path',`inset(0 ${(1-become)*100}% 0 0)`);
    const d2=clamp((t-.74)/.11),pop=d2<.7?(d2/.7)*1.18:1.18-((d2-.7)/.3)*.18;set($('.pt-mark'),'transform',`scale(${pop})`);set($('.portal-side.portal-left'),'transform',`translate(${-t*200}px,${t*70}px) rotate(${-8-t*20}deg)`);set($('.portal-side.portal-right'),'transform',`translate(${t*200}px,${-t*70}px) rotate(${8+t*20}deg)`);$$('.portal-side,.hero-editorial,.portal-caption,.portal-enter,.scroll-cue').forEach(e=>set(e,'opacity',1-clamp(t*2.5)));}
   if(type==='intro'){const t=clamp((y+h*.8-top)/(height*.72));
    /* The line says seeing is immediate and feeling takes longer, so the
       two behave differently. "seen" snaps into contrast word by word.
       "felt" lags, rises, and lets its tracking settle. */
    $$('.statement-word').forEach((w,i)=>{const slow=i>3,
      f=slow?clamp((t-.22)*6-(i-4)*.55):clamp(t*8.5-i*1.15);
      set(w,'--word-fill',f*100+'%');
      set(w,'transform',slow?`translateY(${(1-f)*.22}em) scale(${1+(1-f)*.045})`:'none')});
    const tail=clamp((t-.7)*3.4);
    set($('.intro-bottom'),'opacity',tail);
    set($('.intro-bottom'),'transform',`translateY(${(1-tail)*26}px)`);}
   if(type==='projects'&&wide){const track=$('.project-track'),travel=track.scrollWidth-track.clientWidth;set(track,'transform',`translate3d(${-p*travel}px,0,0)`);$$('.project-panel').forEach((card,i)=>{const local=p*3-i;set(card.querySelector('img'),'transform',`scale(1.13) translateX(${clamp(local,-1,1)*5}%)`);set(card.querySelector('.project-giant'),'transform',`translateX(${local*40}px)`)});$$('.gallery-dots button').forEach((b,i)=>{const active=i===Math.round(p*3);b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});}
   /* The phone cannot hold the horizontal pan, but it can keep what the
      pan is for: pictures that breathe inside their frame and numerals
      that drift against the scroll. Each card is driven by its own
      travel through the viewport instead of one shared track. */
   /* Stacked cards on a phone get the travel the pinned track gives them
      on a desktop. Driven through custom properties because the mobile
      sheet pins the image transform with !important. */
   if(type==='projects'&&!wide){$('.project-panel').forEach(card=>{const r=card.getBoundingClientRect();if(r.bottom<-140||r.top>h+140)return;
     const q=clamp((h-r.top)/(h+r.height)),c=(q-.5)*2,mid=1-Math.abs(c);
     const img=card.querySelector('.image-wrap img');
     set(img,'--py',(c*-5.4).toFixed(2)+'%');
     set(img,'--ps',(1.2-mid*.06).toFixed(3));
     set(card,'--dim',(Math.max(0,-c)*.55).toFixed(3));
     set(card,'--lift',(c*14).toFixed(1)+'px');
     set(card.querySelector('.project-giant'),'transform',`translateY(${(c*-40).toFixed(1)}px)`)});}
   if(type==='material'&&wide){set(el,'--material-p',p);set($('.philosophy>img'),'width',`${48+clamp(p*1.5)*52}%`);set($('.philosophy>img'),'filter',`brightness(${1-clamp(p)*.46})`);set($('.philosophy>img'),'transform',`scale(${1+p*.12})`);set($('.philosophy-content'),'opacity',1-clamp(p*3));set($('.philosophy-content'),'transform',`translateY(${-p*100}px)`);set($('.material-type'),'opacity',clamp((p-.25)*3));set($('.material-type'),'transform',`translate(-50%,-50%) scale(${.72+p*.28})`);set($('.material-label'),'opacity',clamp((p-.45)*3));}
   if(type==='journal'&&wide){const t=clamp((y+h-top)/h);$$('.journal-card').forEach((c,i)=>{set(c,'--entry-y',`${(1-t)*(i+1)*100}px`);set(c,'--entry-rotate',`${(1-t)*(i-1)*14}deg`)})}
   if(type==='contact'){const t=clamp((y+h-top)/h);set($('.contact-heading h2'),'transform',`translateX(${(1-t)*-70}px)`);set($('.big-arrow'),'transform',`rotate(${(1-t)*-90}deg)`)}
   if(type==='detail'){set(el.querySelector('img'),'transform',`scale(${1+clamp((y-top)/height)*.17})`)}
   if(type==='detailImage'){set(el,'clip-path',`inset(0 ${Math.max(0,(.45-view)*32)}%)`)}
  }
  /* Driven off the block's own position rather than the pinned scene,
     so the copy fills the same way whether or not the desktop material
     choreography is running. */
  {const ph=$('.philosophy-content');
   if(ph){const r=ph.getBoundingClientRect();
     if(r.bottom>-120&&r.top<h+120){const words=$$('.philosophy-content .fill-word'),n=words.length||1,
       q=clamp((h*.86-r.top)/Math.max(1,r.height*.72));
       words.forEach((w,i)=>set(w,'--word-fill',clamp((q-(i/n)*.7)/.13)*100+'%'))}}}
  /* No hover on a phone, so the row nearest the middle of the screen
     is the one that shows its space. Scrolling becomes the gesture that
     hover is on a desktop. */
  if(!wide){const rows=$$('.project-directory > a');if(rows.length){let best=null,bd=1e9;rows.forEach(r=>{const b=r.getBoundingClientRect();if(b.bottom<0||b.top>h)return;const d=Math.abs(b.top+b.height/2-h*.46);if(d<bd){bd=d;best=r}});rows.forEach(r=>r.classList.toggle('row-near',r===best))}}
  /* The spine fills as the stages pass the reading line, and the stage
     nearest it becomes the active one. On a phone that scroll is the
     only gesture there is; on a desktop the pointer can still override. */
  {const list=$('.process');
   if(list){const r=list.getBoundingClientRect();
     if(r.bottom>-160&&r.top<h+160){
       const steps=$$('.process .step'),line=h*.52;
       set(list,'--run',clamp((line-r.top)/Math.max(1,r.height))*100+'%');
       let best=-1,bd=1e9;
       steps.forEach((el,i)=>{const b=el.getBoundingClientRect();
         const d=Math.abs(b.top+b.height/2-line);if(d<bd){bd=d;best=i}});
       if(best>-1&&best!==procStep&&!hovering)procShow(best)}}}
  const chapters=[['#studio','02 / THE STUDIO'],['#atelier','03 / DRAWING TO ROOM'],['#projects','04 / SELECTED SPACES'],['#about','05 / MATERIAL & LIGHT'],['#services','06 / THE PRACTICE'],['#journal','07 / STUDIO NOTES'],['#contact','08 / YOUR NEXT CHAPTER']];for(const [selector,label] of chapters){const el=$(selector);if(el&&el.getBoundingClientRect().top<h*.5)chapter=label}$('.chapter-name').textContent=home?chapter:BRAND+' / PROJECT JOURNAL';document.body.classList.toggle('has-scrolled',y>60);lastY=y;
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 function mode(){document.body.classList.toggle('motion-enabled',enabled);document.body.classList.toggle('motion-off',!enabled);document.documentElement.style.scrollBehavior=enabled?'smooth':'auto';if(!enabled){$('.hero')?.style.setProperty('--portal-open','0');}$('.motion-toggle').setAttribute('aria-pressed',String(!enabled));$('.motion-toggle').innerHTML=`Motion ${enabled?'on':'off'} <span>${enabled?'◉':'○'}</span>`;{$$('.portal-title,.portal-last,.portal-side,.hero-editorial,.portal-caption,.portal-enter,.hero,.hero>img,.hero h1,.hero-word,.hero-letter,.hero-top,.scroll-cue,.hero-frame,.project-track,.project-panel img,.project-giant,.philosophy>img,.philosophy-content,.material-type,.material-label,.contact-heading h2,.big-arrow,.detail-hero img,.detail-full').forEach(el=>{['transform','opacity','clip-path','width','filter'].forEach(p=>el.style.removeProperty(p))})}measure()}
 $('.motion-toggle').addEventListener('click',()=>{const anchor=document.elementFromPoint(innerWidth/2,innerHeight/2)?.closest('section');enabled=!enabled;mode();if(anchor)anchor.scrollIntoView({block:'start',behavior:'instant'})});mq.addEventListener('change',()=>{enabled=!mq.matches;mode()});
 let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{mode()},120)});addEventListener('scroll',schedule,{passive:true});addEventListener('load',measure);document.fonts?.ready.then(measure);if('ResizeObserver' in window)new ResizeObserver(measure).observe(document.querySelector('main'));const imageObserver=new IntersectionObserver(entries=>entries.forEach(e=>{e.target.classList.toggle('image-entered',e.isIntersecting)}),{threshold:.15});$$('.project-panel .image-wrap,.room-plan,.philosophy>img').forEach(el=>imageObserver.observe(el));
 /* Each card announces itself as it arrives. Separate from the image
    observer so it can wait until the card is properly in view. */
 const panelObserver=new IntersectionObserver(entries=>entries.forEach(e=>{e.target.classList.toggle('panel-in',e.isIntersecting)}),{threshold:.2,rootMargin:'0px 0px -8% 0px'});$$('.project-panel').forEach(el=>panelObserver.observe(el));
 document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!enabled)return;const target=e.target.closest('[data-cursor]');cursor.classList.toggle('visible',!!target);if(target){cursor.textContent=target.dataset.cursor;cursor.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0)`}});document.addEventListener('pointerleave',()=>cursor.classList.remove('visible'));
 $$('.journal-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(!enabled||e.pointerType!=='mouse')return;const r=card.getBoundingClientRect();set(card,'--tilt-x',`${-(e.clientY-r.top-r.height/2)/r.height*8}deg`);set(card,'--tilt-y',`${(e.clientX-r.left-r.width/2)/r.width*10}deg`)});card.addEventListener('pointerleave',()=>{set(card,'--tilt-x','0deg');set(card,'--tilt-y','0deg')})});
 document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||!enabled||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.target||a.hasAttribute('download'))return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||url.pathname===location.pathname&&url.search===location.search)return;if(!/\.html$/.test(url.pathname))return;e.preventDefault();curtain.classList.add('leaving');setTimeout(()=>location.assign(url.href),480)});addEventListener('pageshow',()=>curtain.classList.remove('leaving'));
 // Horizontal content remains reachable when navigating by keyboard.
 $$('.project-panel').forEach((card,i)=>card.addEventListener('focus',()=>{if(enabled&&isWide()){const top=projectScene.getBoundingClientRect().top+scrollY;scrollTo({top:top+(projectScene.offsetHeight-innerHeight)*i/3,behavior:'instant'})}}));
 mode();
})();
