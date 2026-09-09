(() => {
  'use strict';
  const body = document.body, main = document.querySelector('main');
  const links = document.querySelector('.topbar .links');
  if (!main || !links) return;
  const controls = document.createElement('div');
  controls.className = 'itachi-controls';
  controls.innerHTML = '<button class="itachi-button" type="button" aria-pressed="false">Itachi Mode</button><button class="itachi-button itachi-sound" type="button" aria-pressed="false" hidden>Mute sound</button>';
  links.append(controls);
  const [toggle, sound] = controls.children;
  const stage = document.createElement('div');
  stage.className = 'itachi-stage shell'; stage.hidden = true; stage.setAttribute('aria-hidden','true');
  stage.innerHTML = '<div class="itachi-actor"></div>';
  document.querySelector('.profile').before(stage);
  const overlay = document.createElement('div');
  overlay.className = 'itachi-overlay'; overlay.hidden = true;
  overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-label','Itachi entrance');
  overlay.innerHTML = '<div class="itachi-actor" aria-hidden="true"></div><button class="itachi-skip" type="button">Skip intro · Esc</button>';
  body.append(overlay);
  const skip = overlay.querySelector('button');
  const message = document.createElement('span'); message.className = 'itachi-message'; message.setAttribute('role','status'); body.append(message);
  const canvas = document.createElement('canvas'); canvas.className = 'itachi-canvas'; canvas.setAttribute('aria-hidden','true'); body.append(canvas);
  const ctx = canvas.getContext('2d');
  const audio = new Audio('assets/itachi/sharingan.mp3'); audio.preload = 'auto'; audio.volume = .55;
  const art = new Image(); art.src = 'assets/itachi/poses.png';
  const bat = new Image(); bat.src = 'assets/itachi/bat.png';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  let active = false, intro = false, muted = false, timers = [], particles = [], raf = 0, last = 0, elapsed = 0, lastPointer = 0;
  let width = innerWidth, height = innerHeight, previousOverflow = '';
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function clearTimers(){timers.forEach(clearTimeout);timers=[];}
  function size(){width=innerWidth;height=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=width*d;canvas.height=height*d;if(ctx)ctx.setTransform(d,0,0,d,0,0);}
  size(); addEventListener('resize',size,{passive:true});
  function addBats(x,y,count){if(reduced.matches)return;for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*450,vy:-60-Math.random()*190,life:1.5+Math.random(),max:2.5,size:16+Math.random()*24,phase:Math.random()*6});particles=particles.slice(-64);}
  function drawBat(x,y,s,phase,alpha){if(!ctx||!bat.complete||!bat.naturalWidth)return;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(Math.sin(phase)*.18);ctx.scale(1,.55+Math.abs(Math.sin(phase))* .45);ctx.drawImage(bat,-s/2,-s/3,s,s*2/3);ctx.restore();}
  function frame(now){raf=0;if(!active||document.hidden||reduced.matches||!ctx)return;const dt=Math.min((now-(last||now))/1000,.05);last=now;elapsed+=dt;ctx.clearRect(0,0,width,height);
    const visibleEffects=!intro||overlay.dataset.scene!=='black';
    if(visibleEffects){
      for(let i=0;i<(coarse.matches?12:26);i++){const x=(i*137.71+Math.sin(elapsed*.35+i)*26)%width;const y=((i*91-elapsed*(8+i%5))%height+height)%height;ctx.globalAlpha=.18+(Math.sin(elapsed+i)+1)*.18;ctx.fillStyle=i%4?'#e72d50':'#fff';ctx.beginPath();ctx.arc(x,y,i%3?1:1.8,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
      if(!intro){const r=stage.getBoundingClientRect();if(r.bottom>0&&r.top<height){for(let i=0;i<5;i++){const p=elapsed*(.65+i*.08)+i*1.25;drawBat(r.left+r.width/2+Math.cos(p)*(105+i*13),r.top+110+Math.sin(p)*48,24+i*3,elapsed*12+i,.7);}}}
      particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;drawBat(p.x,p.y,p.size,elapsed*18+p.phase,Math.min(1,Math.max(0,p.life)));});particles=particles.filter(p=>p.life>0);
    }raf=requestAnimationFrame(frame);
  }
  function startFrames(){if(!raf&&!reduced.matches&&!document.hidden){last=0;raf=requestAnimationFrame(frame);}}
  function finish(){if(!active)return;clearTimers();intro=false;main.inert=false;body.style.overflow=previousOverflow;stage.hidden=false;body.classList.add('itachi-revealed');overlay.classList.add('itachi-fade');toggle.disabled=false;toggle.textContent='Normal Mode';toggle.focus({preventScroll:true});message.textContent='Itachi Mode enabled.';later(()=>{overlay.hidden=true;},650);}
  function disable(){clearTimers();active=false;intro=false;audio.pause();audio.currentTime=0;main.inert=false;body.style.overflow=previousOverflow;body.classList.remove('itachi-mode','itachi-revealed');stage.hidden=true;overlay.hidden=true;toggle.textContent='Itachi Mode';toggle.disabled=false;toggle.setAttribute('aria-pressed','false');sound.hidden=true;particles=[];cancelAnimationFrame(raf);raf=0;if(ctx)ctx.clearRect(0,0,width,height);message.textContent='Normal Mode enabled.';}
  function enable(){active=true;intro=true;previousOverflow=body.style.overflow;body.classList.add('itachi-mode');toggle.setAttribute('aria-pressed','true');toggle.disabled=true;sound.hidden=false;overlay.hidden=false;overlay.classList.remove('itachi-fade');overlay.dataset.scene='black';main.inert=true;body.style.overflow='hidden';skip.focus({preventScroll:true});
    audio.currentTime=0;audio.muted=muted;audio.play().catch(()=>{message.textContent='Sound could not play. Use the sound button to retry.';sound.textContent='Play sound';});
    startFrames();if(reduced.matches){finish();return;}
    later(()=>{overlay.dataset.scene='swarm';addBats(width/2,height*.65,coarse.matches?18:36);},2000);
    later(()=>{overlay.dataset.scene='descent';},2850);
    later(()=>{overlay.dataset.scene='land';addBats(width/2,height*.55,14);},3600);
    later(()=>{overlay.dataset.scene='perch';},4050);
    later(finish,4900);
  }
  toggle.addEventListener('click',()=>active?disable():enable());
  skip.addEventListener('click',finish);
  addEventListener('keydown',e=>{if(intro&&e.key==='Escape'){e.preventDefault();finish();}if(intro&&e.key==='Tab'){e.preventDefault();skip.focus();}});
  sound.addEventListener('click',()=>{if(sound.textContent==='Play sound'){muted=false;audio.muted=false;audio.play().catch(()=>{message.textContent='Audio is unavailable.';});}else muted=!muted;audio.muted=muted;sound.textContent=muted?'Unmute sound':'Mute sound';sound.setAttribute('aria-pressed',String(muted));});
  addEventListener('pointermove',e=>{if(!active||intro||coarse.matches||reduced.matches)return;if(performance.now()-lastPointer<90)return;lastPointer=performance.now();addBats(e.clientX,e.clientY,2);},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){audio.pause();cancelAnimationFrame(raf);raf=0;}else if(active)startFrames();});
  reduced.addEventListener('change',()=>{if(reduced.matches){if(intro)finish();cancelAnimationFrame(raf);raf=0;if(ctx)ctx.clearRect(0,0,width,height);}else if(active)startFrames();});
  art.onerror=()=>{message.textContent='Character artwork could not load. Please refresh to try again.';};
})();
