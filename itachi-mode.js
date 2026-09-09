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
  const audio = overlay.querySelector('video'); audio.volume = .7;
  audio.addEventListener('ended', () => {if(intro && audio.ended) later(finish, 900);});
  audio.addEventListener('error', () => {if(intro) playbackProblem();});
  function playbackProblem(){retry.hidden=false;message.textContent='Playback interrupted. Retry the video or skip the intro.';}
  function playIntro(){retry.hidden=true;audio.play().catch(()=>{if(!intro)return;audio.muted=true;audio.play().catch(()=>{if(intro)playbackProblem();});});}
  retry.addEventListener('click',()=>{audio.load();audio.currentTime=0;playIntro();});
  const art = new Image(); art.src = 'assets/itachi/seated.png';
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
  let stormAudio,stormGain,rainSource,nextFlash=12,flash=0;
  function unlockStorm(){try{if(!stormAudio){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;stormAudio=new AC();stormGain=stormAudio.createGain();stormGain.gain.value=0;stormGain.connect(stormAudio.destination);
    const buffer=stormAudio.createBuffer(1,stormAudio.sampleRate*4,stormAudio.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.65;
    rainSource=stormAudio.createBufferSource();rainSource.buffer=buffer;rainSource.loop=true;const filter=stormAudio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2400;rainSource.connect(filter);filter.connect(stormGain);rainSource.start();}stormAudio.resume().catch(()=>{});}catch(e){message.textContent='Weather sound is unavailable in this browser.';}}
  function startStorm(){elapsed=0;nextFlash=10+Math.random()*5;flash=0;if(stormAudio)stormGain.gain.setTargetAtTime(muted?0:.18,stormAudio.currentTime,.8);}
  function stopStorm(){if(stormAudio){stormGain.gain.cancelScheduledValues(stormAudio.currentTime);stormGain.gain.value=0;stormAudio.suspend();}if(weatherCtx)weatherCtx.clearRect(0,0,width,height);}
  function thunder(){if(!stormAudio||muted||document.hidden)return;const t=stormAudio.currentTime;const b=stormAudio.createBuffer(1,stormAudio.sampleRate*4,stormAudio.sampleRate),d=b.getChannelData(0);let v=0;for(let i=0;i<d.length;i++){v=(v+(Math.random()*2-1)*.06)/1.02;d[i]=v*4;}const source=stormAudio.createBufferSource();source.buffer=b;const low=stormAudio.createBiquadFilter();low.type='lowpass';low.frequency.value=170;const gain=stormAudio.createGain();gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(1.7,t+.6);gain.gain.exponentialRampToValueAtTime(.001,t+4);source.connect(low);low.connect(gain);gain.connect(stormGain);source.start(t);source.onended=()=>{source.disconnect();low.disconnect();gain.disconnect();};}
  function drawWeather(dt){if(!weatherCtx)return;weatherCtx.clearRect(0,0,width,height);if(intro||!active||reduced.matches)return;
    weatherCtx.strokeStyle='rgba(195,204,219,.22)';weatherCtx.lineWidth=.7;weatherCtx.beginPath();for(let i=0;i<(coarse.matches?65:140);i++){const x=((i*127.3-elapsed*45)%width+width)%width,y=(i*73.6+elapsed*(330+i%7*25))%(height+40)-20;weatherCtx.moveTo(x,y);weatherCtx.lineTo(x-5,y+16+i%12);}weatherCtx.stroke();
    if(elapsed>nextFlash){flash=.12;nextFlash=elapsed+12+Math.random()*12;thunder();}if(flash>0){weatherCtx.fillStyle='rgba(205,218,245,'+flash+')';weatherCtx.fillRect(0,0,width,height);flash=Math.max(0,flash-dt*.3);}
  }
  function startFrames(){if(!raf&&!reduced.matches&&!document.hidden){last=0;raf=requestAnimationFrame(frame);}}
  function finish(){if(!active||!intro)return;clearTimers();audio.pause();intro=false;startStorm();main.inert=false;body.style.overflow=previousOverflow;stage.hidden=false;body.classList.add('itachi-revealed');overlay.classList.add('itachi-fade');toggle.disabled=false;toggle.textContent='Normal Mode';toggle.focus({preventScroll:true});message.textContent='Itachi Mode enabled.';later(()=>{overlay.hidden=true;},650);}
  function disable(){clearTimers();stopStorm();active=false;intro=false;audio.pause();audio.currentTime=0;main.inert=false;body.style.overflow=previousOverflow;body.classList.remove('itachi-mode','itachi-revealed');stage.hidden=true;overlay.hidden=true;toggle.textContent='Itachi Mode';toggle.disabled=false;toggle.setAttribute('aria-pressed','false');sound.hidden=true;particles=[];cancelAnimationFrame(raf);raf=0;if(ctx)ctx.clearRect(0,0,width,height);message.textContent='Normal Mode enabled.';}
  function enable(){unlockStorm();active=true;intro=true;retry.hidden=true;previousOverflow=body.style.overflow;body.classList.add('itachi-mode');toggle.setAttribute('aria-pressed','true');toggle.disabled=true;sound.hidden=false;overlay.hidden=false;overlay.classList.remove('itachi-fade');overlay.dataset.scene='black';main.inert=true;body.style.overflow='hidden';skip.focus({preventScroll:true});
    audio.currentTime=0;audio.muted=muted;
    startFrames();
    // Playback starts inside the click gesture; the clip owns the full entrance timing and sound.
    playIntro();
  }

  toggle.addEventListener('click',()=>active?disable():enable());
  skip.addEventListener('click',finish);
  addEventListener('keydown',e=>{if(intro&&e.key==='Escape'){e.preventDefault();finish();}if(intro&&e.key==='Tab'){e.preventDefault();if(!retry.hidden&&document.activeElement===skip)retry.focus();else skip.focus();}});
  sound.addEventListener('click',()=>{muted=!muted;audio.muted=muted;if(stormGain)stormGain.gain.setTargetAtTime(active&&!intro&&!muted?.18:0,stormAudio.currentTime,.2);sound.textContent=muted?'Unmute sound':'Mute sound';sound.setAttribute('aria-pressed',String(muted));});
  addEventListener('pointermove',e=>{if(!active||intro||coarse.matches||reduced.matches)return;if(performance.now()-lastPointer<90)return;lastPointer=performance.now();addBats(e.clientX,e.clientY,2);},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(stormAudio)stormAudio.suspend();audio.pause();cancelAnimationFrame(raf);raf=0;}else if(active){if(stormAudio)stormAudio.resume().catch(()=>{});startFrames();if(intro&&!audio.ended)playIntro();}});
  reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(raf);raf=0;if(ctx)ctx.clearRect(0,0,width,height);if(weatherCtx)weatherCtx.clearRect(0,0,width,height);}else if(active)startFrames();});
  art.onerror=()=>{message.textContent='Character artwork could not load. Please refresh to try again.';};
})();
