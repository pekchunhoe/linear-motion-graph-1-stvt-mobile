import { test, expect } from '@playwright/test';
import { model, stateAt } from '../js/physics.js';
import AxeBuilder from '@axe-core/playwright';
const sizes=[[320,568],[360,640],[375,667],[390,844],[412,915],[768,1024],[820,1180],[1024,768],[1180,820],[1366,768],[1440,900]];
const primary=model.id===1?'#positionCanvas':'#velocityCanvas';
const derived=model.id===1?'#velocityCanvas':'#accCanvas';
async function seek(page,t) {
  await page.locator('#timeScrubber').fill(String(t));
  await expect(page.locator('#live-t')).toHaveText(`${t.toFixed(2)} s`);
}
async function geometry(page) {
  return page.evaluate(()=>{
    const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    return {overflow:document.documentElement.scrollWidth>innerWidth,car:rect('#carContainer'),road:rect('.road'),
      canvases:[...document.querySelectorAll('canvas')].map(c=>({width:c.clientWidth,height:c.clientHeight,backing:c.width,dpr:devicePixelRatio,focus:c.tabIndex,label:c.getAttribute('aria-label')})),
      cards:[...document.querySelectorAll('.dashboard>.card')].map(c=>c.getBoundingClientRect().y),
      badControls:[...document.querySelectorAll('button,input,select,textarea')].filter(c=>c.getClientRects().length).filter(c=>{const r=c.getBoundingClientRect();return r.width<=0||r.right>innerWidth+1||r.left<0;}).map(c=>c.id)};
  });
}
test.beforeEach(async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page._errors=errors;
  await page.goto('/');
  await expect(page.locator('#live-position')).toHaveText('0.00 m');
});
test.afterEach(async({page})=>expect(page._errors).toEqual([]));
for(const [width,height] of sizes) {
  test(`layout ${width}×${height}: sharp graphs, car, controls, no overflow`,async({page},info)=>{
    await page.setViewportSize({width,height});
    await seek(page,model.id===1?20:11);
    await expect.poll(async()=>{const g=await geometry(page);return g.canvases.every(c=>Math.abs(c.backing-c.width*c.dpr)<3);}).toBe(true);
    const g=await geometry(page);
    expect(g.overflow).toBe(false);expect(g.badControls).toEqual([]);
    expect(g.car.x).toBeGreaterThanOrEqual(g.road.x);expect(g.car.right).toBeLessThanOrEqual(g.road.right);
    for(const canvas of g.canvases){expect(canvas.width).toBeGreaterThan(230);expect(canvas.height).toBeGreaterThanOrEqual(230);expect(canvas.focus).toBe(0);expect(canvas.label).toBeTruthy();}
    if(width>=1000)expect(Math.max(...g.cards)-Math.min(...g.cards)).toBeLessThan(2);
    await page.screenshot({path:info.outputPath(`sim${model.id}-${width}x${height}.png`),fullPage:true});
    // Open all learning panels too: narrow layouts must fit expanded controls.
    await page.locator('details').evaluateAll(nodes=>nodes.forEach(n=>{n.open=true;}));
    const expanded=await geometry(page);expect(expanded.overflow).toBe(false);expect(expanded.badControls).toEqual([]);
  });
}
test('play stop resume reset rapid taps and end restart',async({page})=>{
  await page.locator('#playBtn').click();
  await expect.poll(async()=>Number(await page.locator('#timeScrubber').inputValue())).toBeGreaterThan(0.1);
  await page.locator('#stopBtn').click();const stopped=await page.locator('#timeScrubber').inputValue();
  await page.waitForTimeout(180);expect(await page.locator('#timeScrubber').inputValue()).toBe(stopped);
  await page.locator('#playBtn').click();
  await expect.poll(async()=>Number(await page.locator('#timeScrubber').inputValue())).toBeGreaterThan(Number(stopped));
  await page.locator('#playBtn').evaluate(button=>{for(let i=0;i<20;i++)button.click();});
  await page.locator('#stopBtn').click();await page.locator('#playBtn').click();await page.locator('#resetBtn').click();
  await expect(page.locator('#timeScrubber')).toHaveValue('0');await expect(page.locator('#playbackStatus')).toHaveText('Paused');
  await seek(page,model.end);await page.locator('#playBtn').click();
  await expect.poll(async()=>Number(await page.locator('#timeScrubber').inputValue())).toBeLessThan(2);
  await page.locator('#stopBtn').click();
});
test('scrubber synchronizes exact values, corner treatment and car',async({page})=>{
  for(const t of [0,...model.segments.map(s=>s.end),model.id===1?7:9.6,model.id===1?20:11]) {
    await seek(page,t);const state=stateAt(model,t);
    for(const [key,unit] of [['position','m'],['distance','m'],['displacement','m'],['velocity','m s⁻¹'],['acceleration','m s⁻²']]) {
      const value=state[key];await expect(page.locator('#live-'+key)).toHaveText(value===null?'Undefined':`${Math.abs(value)<1e-8?'0.00':value.toFixed(2)} ${unit}`);
    }
    const mapped=await page.locator('#carContainer').evaluate(car=>({left:parseFloat(car.style.left),road:car.parentElement.clientWidth}));
    // CSS serializes positions to a limited decimal precision; allow 0.001 CSS px.
    expect(Math.abs(mapped.left-(35+(state.position-model.road[0])/(model.road[1]-model.road[0])*(mapped.road-70)))).toBeLessThan(0.001);
    if(state.velocity!==null&&state.velocity<0)await expect(page.locator('#carSVG')).toHaveCSS('transform','matrix(-1, 0, 0, 1, 0, 0)');
  }
  await seek(page,model.id===1?15:8);await expect(page.locator('#primaryReadout')).toContainText('undefined exactly');
});
test('keyboard and native input editing',async({page})=>{
  await page.locator(primary).focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#live-t')).toHaveText('0.10 s');
  await page.keyboard.press('Shift+ArrowRight');await expect(page.locator('#live-t')).toHaveText('1.10 s');
  await page.keyboard.press('ArrowLeft');await expect(page.locator('#live-t')).toHaveText('1.00 s');
  await page.keyboard.press('End');await expect(page.locator('#live-t')).toHaveText(`${model.end.toFixed(2)} s`);
  await page.keyboard.press('Home');await expect(page.locator('#live-t')).toHaveText('0.00 s');
  await page.keyboard.press('Space');await expect(page.locator('#playbackStatus')).toHaveText('Playing');
  await page.keyboard.press('Space');await expect(page.locator('#playbackStatus')).toHaveText('Paused');
  await page.keyboard.press('r');await expect(page.locator('#live-t')).toHaveText('0.00 s');
  await page.locator('#challenges summary').click();await page.locator('#challengeAnswer').fill('r');
  await page.locator('#challengeAnswer').press('ArrowRight');await expect(page.locator('#challengeAnswer')).toHaveValue('r');
});
test('mouse dragging either graph pauses playback',async({page})=>{
  for(const selector of [primary,derived]) {
    await page.locator('#playBtn').click();await page.locator(selector).scrollIntoViewIfNeeded();
    const r=await page.locator(selector).boundingBox();
    await page.mouse.move(r.x+50,r.y+100);await page.mouse.down();
    await page.mouse.move(r.x+r.width-22,r.y+100,{steps:8});await page.mouse.up();
    await expect(page.locator('#playbackStatus')).toHaveText('Paused');
    expect(Number(await page.locator('#timeScrubber').inputValue())).toBeGreaterThan(model.end*0.9);
  }
});
test('touch drag, cancellation, secondary contacts and pen',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const cdp=await page.context().newCDPSession(page);
  for(const selector of [primary,derived]) {
    await page.locator(selector).scrollIntoViewIfNeeded();const r=await page.locator(selector).boundingBox();
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+65,y:r.y+80,id:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:r.x+r.width-35,y:r.y+80,id:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    expect(Number(await page.locator('#timeScrubber').inputValue())).toBeGreaterThan(model.end*0.8);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+75,y:r.y+80,id:2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  }
  await page.locator(primary).scrollIntoViewIfNeeded();const r=await page.locator(primary).boundingBox();
  await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:r.x+100,y:r.y+80,button:'left',clickCount:1,pointerType:'pen'});
  const before=await page.locator('#timeScrubber').inputValue();
  await page.locator(primary).dispatchEvent('pointerdown',{pointerId:999,isPrimary:false,button:0,clientX:r.x+r.width-20,pointerType:'touch'});
  expect(await page.locator('#timeScrubber').inputValue()).toBe(before);
  await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x+r.width-30,y:r.y+80,button:'left',buttons:1,pointerType:'pen'});
  await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:r.x+r.width-30,y:r.y+80,button:'left',clickCount:1,pointerType:'pen'});
  expect(Number(await page.locator('#timeScrubber').inputValue())).toBeGreaterThan(model.end*0.8);
  await page.locator('#playBtn').click();await expect(page.locator('#playbackStatus')).toHaveText('Playing');
});
test('resize orientation and prediction preserve state',async({page})=>{
  await seek(page,7);await page.setViewportSize({width:390,height:844});
  await page.setViewportSize({width:1180,height:820});
  await expect(page.locator('#live-t')).toHaveText('7.00 s');
  await page.locator('#predictBtn').click();await expect(page.locator(derived)).toBeHidden();
  await expect(page.locator('#live-t')).toHaveText('7.00 s');
  await page.locator('#predictBtn').click();await expect(page.locator(derived)).toBeVisible();
  await expect(page.locator('#live-t')).toHaveText('7.00 s');
  await page.locator('#playBtn').click();await page.setViewportSize({width:820,height:1180});
  await expect(page.locator('#playbackStatus')).toHaveText('Playing');
  await expect.poll(async()=>Number(await page.locator('#timeScrubber').inputValue())).toBeGreaterThan(7);
  await page.locator('#stopBtn').click();
});
test('challenge feedback, hints, solutions and concepts',async({page})=>{
  await page.locator('#challenges summary').click();await page.locator('#solutionBtn').click();
  await expect(page.locator('#challengeFeedback')).toContainText('Try an answer');
  await page.locator('#challengeAnswer').fill(model.id===1?'positive':'negative');await page.locator('#checkAnswer').click();
  await expect(page.locator('#challengeFeedback')).toContainText('Correct');
  await page.locator('#hintBtn').click();await expect(page.locator('#challengeFeedback')).not.toBeEmpty();
  await page.locator('#solutionBtn').click();await expect(page.locator('#challengeFeedback')).toContainText('m s⁻¹');
  await page.locator('#challengeSelect').selectOption('1');await expect(page.locator('#challengeAnswer')).toHaveValue('');
  await page.locator('.concept-link').click();await expect(page.locator('#conceptContent')).toBeVisible();
  await expect(page.locator('#conceptContent')).toContainText('Negative acceleration does not always mean slowing down');
});
test('simulation-specific learning tools',async({page},info)=>{
  if(model.id===1) {
    await page.locator('#averagePanel summary').click();await page.locator('#averageMode').check();
    await expect(page.locator('#averageResult')).toContainText('10.00 m s⁻¹');
    await page.locator('#t1').fill('10');await expect(page.locator('#averageResult')).toContainText('two different times');
    await page.locator('#t1').fill('0');
    await page.locator('#workedExample summary').click();
    for(const [i,answer] of ['12','15','1.2'].entries()) {
      await page.locator(`#exampleShow${i}`).click();await expect(page.locator(`#exampleFeedback${i}`)).toContainText('Attempt');
      await page.locator(`#example${i}`).fill(answer);await page.locator(`#exampleCheck${i}`).click();
      await expect(page.locator(`#exampleFeedback${i}`)).toContainText('Correct');
      await page.locator(`#exampleShow${i}`).click();await expect(page.locator(`#exampleFeedback${i}`)).not.toContainText('Attempt');
    }
  } else {
    await seek(page,18);await expect(page.locator('#velocityAreaResult')).toContainText('262.00 m');
    await page.locator('#areaMode').selectOption('distance');await page.locator('#accelerationArea').check();
    await page.locator('#areaStart').fill('8');await seek(page,12);
    await expect(page.locator('#accelerationAreaResult')).toContainText('−50.00'.replace('−','-'));
    await page.locator('#areaStart').fill('15');await expect(page.locator('#velocityAreaResult')).toContainText('later than current time');
    await page.locator('#areaStart').fill('0');
    await page.locator('#abcde summary').click();
    for(const [i,d,s] of [[0,'positive','speeding up'],[1,'positive','slowing down'],[2,'negative','speeding up'],[3,'negative','slowing down']]) {
      await page.locator(`#abcDirection${i}`).selectOption(d);await page.locator(`#abcSpeed${i}`).selectOption('constant');
      await expect(page.locator(`#abcFeedback${i}`)).toContainText('Not yet');
      await page.locator(`#abcSpeed${i}`).selectOption(s);await expect(page.locator(`#abcFeedback${i}`)).toContainText('Correct');
    }
  }
  await page.screenshot({path:info.outputPath(`sim${model.id}-learning.png`),fullPage:true});
});
test('zoom access, reduced motion and car without interpolation',async({page})=>{
  expect(await page.locator('meta[name="viewport"]').getAttribute('content')).toBe('width=device-width, initial-scale=1');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('#carSVG')).toHaveCSS('transition-duration','0s');
  await expect(page.locator('#carContainer')).toHaveCSS('transition-duration','0s');
  await page.locator('#playBtn').click();await expect(page.locator('#playbackStatus')).toHaveText('Playing');
});
test('accessibility audit with every learning panel expanded',async({page})=>{
  await page.locator('details').evaluateAll(nodes=>nodes.forEach(node=>{node.open=true;}));
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});
