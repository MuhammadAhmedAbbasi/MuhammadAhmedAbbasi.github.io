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
  stage.innerHTML = '<div class="itachi-actor"><img src="assets/itachi/seated.png" alt=""></div>';
  document.querySelector('.profile').before(stage);
  const overlay = document.createElement('div');
  overlay.className = 'itachi-overlay'; overlay.hidden = true;
  overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-label','Itachi entrance');
  overlay.innerHTML = '<video class="itachi-video" src="assets/itachi/intro-full.mp4" playsinline preload="auto" aria-hidden="true"></video><button class="itachi-retry itachi-button" type="button" hidden>Retry video</button><button class="itachi-skip" type="button">Skip intro · Esc</button>';
  body.append(overlay);
  const skip = overlay.querySelector('.itachi-skip');
  const retry = overlay.querySelector('.itachi-retry');
  const message = document.createElement('span'); message.className = 'itachi-message'; message.setAttribute('role','status'); body.append(message);
  const canvas = document.createElement('canvas'); canvas.className = 'itachi-canvas'; canvas.setAttribute('aria-hidden','true'); body.append(canvas);
  const ctx = canvas.getContext('2d');
  const audio = overlay.querySelector('video'); audio.volume = .7; audio.playbackRate = 1.15;
  audio.addEventListener('ended', () => {if(intro && audio.ended) later(finish, 900);});
  audio.addEventListener('error', () => {if(intro) playbackProblem();});
  function playbackProblem(){retry.hidden=false;message.textContent='Playback interrupted. Retry the video or skip the intro.';}
  function playIntro(){retry.hidden=true;audio.play().catch(()=>{if(!intro)return;audio.muted=true;audio.play().catch(()=>{if(intro)playbackProblem();});});}
  retry.addEventListener('click',()=>{audio.load();audio.currentTime=0;audio.playbackRate=1.15;playIntro();});
  const art = new Image(); art.src = 'assets/itachi/seated.png';
  const bat = new Image(); bat.src = 'assets/itachi/bat.png';
  const rainAudio = new Audio('assets/itachi/Rain_audio.mp3');
  const thunderAudio = new Audio('assets/itachi/Thurnderstorm.mp3');
  rainAudio.loop = true; rainAudio.volume = .22;
  thunderAudio.volume = .5;
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
  function frame(now){raf=0;if(!active||document.hidden||reduced.matches||!ctx)return;const dt=Math.min((now-(last||now))/1000,.05);last=now;elapsed+=dt;drawWeather(dt);ctx.clearRect(0,0,width,height);
    const visibleEffects=!intro;
    if(visibleEffects){
      for(let i=0;i<(coarse.matches?12:26);i++){const x=(i*137.71+Math.sin(elapsed*.35+i)*26)%width;const y=((i*91-elapsed*(8+i%5))%height+height)%height;ctx.globalAlpha=.18+(Math.sin(elapsed+i)+1)*.18;ctx.fillStyle=i%4?'#e72d50':'#fff';ctx.beginPath();ctx.arc(x,y,i%3?1:1.8,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
      if(!intro){const r=stage.getBoundingClientRect();if(r.bottom>0&&r.top<height){for(let i=0;i<5;i++){const p=elapsed*(.65+i*.08)+i*1.25;drawBat(r.left+r.width/2+Math.cos(p)*(55+i*9),r.top+75+Math.sin(p)*33,14+i*2,elapsed*12+i,.7);}}}
      particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;drawBat(p.x,p.y,p.size,elapsed*18+p.phase,Math.min(1,Math.max(0,p.life)));});particles=particles.filter(p=>p.life>0);
    }raf=requestAnimationFrame(frame);
  }
  // Weather sits behind the portfolio; its audio is synthesized locally with Web Audio.
  const weather = document.createElement('canvas'); weather.className='itachi-weather';weather.setAttribute('aria-hidden','true');body.prepend(weather);
  const weatherCtx=weather.getContext('2d');
  function sizeWeather(){const d=Math.min(devicePixelRatio||1,2);weather.width=innerWidth*d;weather.height=innerHeight*d;if(weatherCtx)weatherCtx.setTransform(d,0,0,d,0,0);}
  sizeWeather();addEventListener('resize',sizeWeather,{passive:true});
  let nextFlash=5,flash=0,lightningBolt=[];
  function unlockStorm(){rainAudio.muted=muted;thunderAudio.muted=muted;}
  function startStorm(){elapsed=0;nextFlash=5;flash=0;rainAudio.muted=muted;rainAudio.play().catch(()=>{message.textContent='Rain audio is unavailable in this browser.';});}
  function stopStorm(){rainAudio.pause();rainAudio.currentTime=0;thunderAudio.pause();thunderAudio.currentTime=0;if(weatherCtx)weatherCtx.clearRect(0,0,width,height);}
  function lightning(){flash=.42;const x=width*(.18+Math.random()*.64),points=[[x,-10]];let y=-10,boltX=x;while(y<height*.65){y+=35+Math.random()*55;boltX+=(Math.random()-.5)*72;points.push([boltX,y]);}lightningBolt=points;if(!muted&&!document.hidden){thunderAudio.currentTime=0;thunderAudio.play().catch(()=>{});}}
  function drawLightning(){if(!lightningBolt.length||flash<=0||!weatherCtx)return;weatherCtx.save();weatherCtx.globalAlpha=Math.min(1,flash*2.4);weatherCtx.strokeStyle='#f5fbff';weatherCtx.lineWidth=2.4;weatherCtx.shadowColor='#b7d7ff';weatherCtx.shadowBlur=20;weatherCtx.beginPath();lightningBolt.forEach((point,index)=>index?weatherCtx.lineTo(point[0],point[1]):weatherCtx.moveTo(point[0],point[1]));weatherCtx.stroke();weatherCtx.restore();}
  function drawWeather(dt){if(!weatherCtx)return;weatherCtx.clearRect(0,0,width,height);if(intro||!active||reduced.matches)return;
    weatherCtx.strokeStyle='rgba(215,226,239,.42)';weatherCtx.lineWidth=1;weatherCtx.beginPath();for(let i=0;i<(coarse.matches?65:210);i++){const x=((i*127.3-elapsed*45)%width+width)%width,y=(i*73.6+elapsed*(390+i%7*30))%(height+46)-23;weatherCtx.moveTo(x,y);weatherCtx.lineTo(x-7,y+21+i%14);}weatherCtx.stroke();
    if(elapsed>nextFlash){lightning();nextFlash=elapsed+5;}if(flash>0){weatherCtx.fillStyle='rgba(219,231,255,'+(flash*.46)+')';weatherCtx.fillRect(0,0,width,height);drawLightning();flash=Math.max(0,flash-dt*1.8);}else{lightningBolt=[];}
  }
  function startFrames(){if(!raf&&!reduced.matches&&!document.hidden){last=0;raf=requestAnimationFrame(frame);}}
  function finish(){if(!active||!intro)return;clearTimers();audio.pause();intro=false;startStorm();main.inert=false;body.style.overflow=previousOverflow;stage.hidden=false;body.classList.add('itachi-revealed');overlay.classList.add('itachi-fade');toggle.disabled=false;toggle.textContent='Normal Mode';toggle.focus({preventScroll:true});message.textContent='Itachi Mode enabled.';later(()=>{overlay.hidden=true;},650);}
  function disable(){clearTimers();stopStorm();active=false;intro=false;audio.pause();audio.currentTime=0;main.inert=false;body.style.overflow=previousOverflow;body.classList.remove('itachi-mode','itachi-revealed');stage.hidden=true;overlay.hidden=true;toggle.textContent='Itachi Mode';toggle.disabled=false;toggle.setAttribute('aria-pressed','false');sound.hidden=true;particles=[];cancelAnimationFrame(raf);raf=0;if(ctx)ctx.clearRect(0,0,width,height);message.textContent='Normal Mode enabled.';}
  function enable(){unlockStorm();active=true;intro=true;retry.hidden=true;previousOverflow=body.style.overflow;body.classList.add('itachi-mode');toggle.setAttribute('aria-pressed','true');toggle.disabled=true;sound.hidden=false;overlay.hidden=false;overlay.classList.remove('itachi-fade');overlay.dataset.scene='black';main.inert=true;body.style.overflow='hidden';skip.focus({preventScroll:true});
    audio.currentTime=0;audio.playbackRate=1.15;audio.muted=muted;
    startFrames();
    // Playback starts inside the click gesture; the clip owns the full entrance timing and sound.
    playIntro();
  }

  toggle.addEventListener('click',()=>active?disable():enable());
  skip.addEventListener('click',finish);
  addEventListener('keydown',e=>{if(intro&&e.key==='Escape'){e.preventDefault();finish();}if(intro&&e.key==='Tab'){e.preventDefault();if(!retry.hidden&&document.activeElement===skip)retry.focus();else skip.focus();}});
  sound.addEventListener('click',()=>{muted=!muted;audio.muted=muted;rainAudio.muted=muted;thunderAudio.muted=muted;sound.textContent=muted?'Unmute sound':'Mute sound';sound.setAttribute('aria-pressed',String(muted));});
  addEventListener('pointermove',e=>{if(!active||intro||coarse.matches||reduced.matches)return;if(performance.now()-lastPointer<90)return;lastPointer=performance.now();addBats(e.clientX,e.clientY,2);},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){rainAudio.pause();thunderAudio.pause();audio.pause();cancelAnimationFrame(raf);raf=0;}else if(active){if(!intro)startStorm();startFrames();if(intro&&!audio.ended)playIntro();}});
  reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(raf);raf=0;if(ctx)ctx.clearRect(0,0,width,height);if(weatherCtx)weatherCtx.clearRect(0,0,width,height);}else if(active)startFrames();});
  art.onerror=()=>{message.textContent='Character artwork could not load. Please refresh to try again.';};
})();
