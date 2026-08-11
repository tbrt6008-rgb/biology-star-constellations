4201: 
4202:   buildConnectionLines(s);
4203: 
4204:   showPoster(s);
4205: 
4206: }
4207: 
4208: function deselectScientist() {
4209: 
4210:   selectedId = null;
4211: 
4212:   connectionLines = [];
4213: 
4214:   const overlay = document.getElementById('poster-overlay');
4215: 
4216:   overlay.classList.remove('open');
4217: 
4218:   // Delay display none to allow fade out transition
4219: 
4220:   setTimeout(() => {
4221: 
4222:     if (!selectedId) {
4223: 
4224:       overlay.style.display = 'none';
4225: 
4226:       if (posterAnimationId) {
4227: 
4228:         cancelAnimationFrame(posterAnimationId);
4229: 
4230:         posterAnimationId = null;
4231: 
4232:       }
4233: 
4234:     }
4235: 
4236:   }, 350);
4237: 
4238: }
4239: 
4240: function buildConnectionLines(s) {
4241: 
4242:   // 根据用户要求，完全关闭科学家之间的任何关系连线
4243: 
4244:   connectionLines = [];
4245: 
4246: }
4247: 
4248: function renderPosterPlanet(s) {
4249: 
4250:   const pcv = document.getElementById('poster-canvas');
4251: 
4252:   if (!pcv) return;
4253: 
4254:   const pctx = pcv.getContext('2d');
4255: 
4256:   const w = pcv.width;
4257: 
4258:   const h = pcv.height;
4259: 
4260:   pctx.clearRect(0, 0, w, h);
4261: 
4262:   const cx = w / 2;
4263: 
4264:   const cy = h / 2;
4265: 
4266:   const r = w / 2 - 35;
4267: 
4268:   pctx.save();
4269: 
4270:   // 1. 轨道专属主题色柔和大气的边缘晕光 (Atmospheric Aura)
4271: 
4272:   const c = ORBIT_COLORS[s.orbit];
4273: 
4274:   const auraG = pctx.createRadialGradient(cx, cy, r - 6, cx, cy, r + 26);
4275: 
4276:   auraG.addColorStop(0, `hsla(${c.h},${c.s}%,${c.l}%,0.42)`);
4277: 
4278:   auraG.addColorStop(0.25, `hsla(${c.h},${c.s}%,${c.l}%,0.18)`);
4279: 
4280:   auraG.addColorStop(1, 'rgba(0,0,0,0)');
4281: 
4282:   pctx.fillStyle = auraG;
4283: 
4284:   pctx.beginPath();
4285: 
4286:   pctx.arc(cx, cy, r + 26, 0, Math.PI * 2);
4287: 
4288:   pctx.fill();
4289: 
4290:   // 2. 裁剪圆形并绘制滚动纹理以进行逼真的行星自转
4291: 
4292:   pctx.beginPath();
4293: 
4294:   pctx.arc(cx, cy, r, 0, Math.PI * 2);
4295: 
4296:   pctx.clip();
4297: 
4298:   if (s._textureImg && s._textureLoaded) {
4299: 
4300:     const aspect = s._textureImg.width / s._textureImg.height;
4301: 
4302:     const drawW = Math.max(r * 2, r * 2 * aspect);
4303: 
4304:     const drawH = r * 2;
4305: 
4306:     const rotSpeed = 0.008; // 自转稍微慢一些，显得更庞大和神秘
4307: 
4308:     let textureOffset = (posterFrame * rotSpeed * drawW * 0.15) % drawW;
4309: 
4310:     if (textureOffset < 0) {
4311: 
4312:       textureOffset += drawW;
4313: 
4314:     }
4315: 
4316:     const drawX = cx - r - textureOffset;
4317: 
4318:     const drawY = cy - r;
4319: 
4320:     // 双图覆盖，微重叠无缝拼接自转以消除亚像素缝隙
4321: 
4322:     pctx.drawImage(s._textureImg, drawX, drawY, drawW + 1.5, drawH);
4323: 
4324:     pctx.drawImage(s._textureImg, drawX + drawW - 0.75, drawY, drawW + 1.5, drawH);
4325: 
4326:     // 3. 3D 球体明亮光泽罩：在顶部加高光，底部偏暗，形成太空立体的深邃感
4327: 
4328:     const sphereShadow = pctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx, cy, r * 1.02);
4329: 
4330:     sphereShadow.addColorStop(0, 'rgba(255, 255, 255, 0.45)'); // 顶部亮光
4331: 
4332:     sphereShadow.addColorStop(0.35, 'rgba(255, 255, 255, 0.08)'); // 亮面微弱漫反射
4333: 
4334:     sphereShadow.addColorStop(0.75, 'rgba(0, 0, 0, 0.35)');       // 暗部过渡
4335: 
4336:     sphereShadow.addColorStop(1, 'rgba(0, 0, 0, 0.82)');          // 底部极暗
4337: 
4338:     pctx.fillStyle = sphereShadow;
4339: 
4340:     pctx.fill();
4341: 
4342:   } else {
4343: 
4344:     // 降级使用纯程序化渐变
4345: 
4346:     const g = pctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx + r * 0.1, cy + r * 0.1, r * 1.15);
4347: 
4348:     g.addColorStop(0, `hsl(${c.h + 8},${c.s}%,${c.l + 25}%)`);
4349: 
4350:     g.addColorStop(0.45, `hsl(${c.h},${c.s}%,${c.l}%)`);
4351: 
4352:     g.addColorStop(1, `hsl(${c.h - 12},${c.s + 10}%,${c.l - 28}%)`);
4353: 
4354:     pctx.fillStyle = g;
4355: 
4356:     pctx.fill();
4357: 
4358:     const hl = pctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx, cy, r * 0.95);
4359: 
4360:     hl.addColorStop(0, 'rgba(255,255,255,0.55)');
4361: 
4362:     hl.addColorStop(0.5, 'rgba(255,255,255,0.08)');
4363: 
4364:     hl.addColorStop(1, 'rgba(0,0,0,0)');
4365: 
4366:     pctx.fillStyle = hl;
4367: 
4368:     pctx.fillRect(cx - r, cy - r, r * 2, r * 2);
4369: 
4370:   }
4371: 
4372:   pctx.restore();
4373: 
4374:   // 4. 完美复刻：绘制行星外侧的圆轨道线 (Orbit line)
4375: 
4376:   pctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
4377: 
4378:   pctx.lineWidth = 0.8;
4379: 
4380:   pctx.beginPath();
4381: 
4382:   pctx.arc(cx, cy, r + 16, 0, Math.PI * 2);
4383: 
4384:   pctx.stroke();
4385: 
4386:   // 绘制 4 个小圆圈指示点，对应西北、东北、西南、东南 4 个角上的元数据
4387: 
4388:   const angles = [Math.PI * 1.25, Math.PI * 1.75, Math.PI * 0.75, Math.PI * 0.25];
4389: 
4390:   pctx.fillStyle = '#ffffff';
4391: 
4392:   pctx.strokeStyle = '#ffffff';
4393: 
4394:   for (const angle of angles) {
4395: 
4396:     const dx = cx + Math.cos(angle) * (r + 16);
4397: 
4398:     const dy = cy + Math.sin(angle) * (r + 16);
4399: 
4400:     // 实心点
4401: 
4402:     pctx.beginPath();
4403: 
4404:     pctx.arc(dx, dy, 2, 0, Math.PI * 2);
4405: 
4406:     pctx.fill();
4407: 
4408:     // 空心外圈
4409: 
4410:     pctx.beginPath();
4411: 
4412:     pctx.arc(dx, dy, 4, 0, Math.PI * 2);
4413: 
4414:     pctx.lineWidth = 0.6;
4415: 
4416:     pctx.stroke();
4417: 
4418:   }
4419: 
4420:   posterFrame++;
4421: 
4422:   posterAnimationId = requestAnimationFrame(() => renderPosterPlanet(s));
4423: 
4424: }
4425: 
4426: const ORBIT_CENTER_ICONS = {
4427: 
4428:   1: '🔬',
4429: 
4430:   2: '🧬',
4431: 
4432:   3: '🌿',
4433: 
4434:   4: '🦊',
4435: 
4436:   5: '🧪'
4437: 
4438: };
4439: 
4440: function drawMiniOrbit(orbitNum) {
4441: 
4442:   const ocv = document.getElementById('mini-orbit-canvas');
4443: 
4444:   if (!ocv) return;
4445: 
4446:   const octx = ocv.getContext('2d');
4447: 
4448:   // High-DPI support
4449: 
4450:   const dpr = window.devicePixelRatio || 1;
4451: 
4452:   ocv.width = 100 * dpr;
4453: 
4454:   ocv.height = 100 * dpr;
4455: 
4456:   octx.scale(dpr, dpr);
4457: 
4458:   octx.clearRect(0, 0, 100, 100);
4459: 
4460:   const cx = 50, cy = 50;
4461: 
4462:   // 1. Draw central star (sun)
4463: 
4464:   octx.fillStyle = '#ffffff';
4465: 
4466:   octx.beginPath();
4467: 
4468:   octx.arc(cx, cy, 3, 0, Math.PI * 2);
4469: 
4470:   octx.fill();
4471: 
4472:   // 2. Draw concentric rings
4473: 
4474:   const themeColor = ORBIT_COLORS[orbitNum].hex;
4475: 
4476:   for (let i = 1; i <= 5; i++) {
4477: 
4478:     const radius = 10 + i * 7.5;
4479: 
4480:     octx.strokeStyle = (i === orbitNum) ? themeColor : 'rgba(255,255,255,0.08)';
4481: 
4482:     octx.lineWidth = (i === orbitNum) ? 1.2 : 0.6;
4483: 
4484:     octx.beginPath();
4485: 
4486:     octx.arc(cx, cy, radius, 0, Math.PI * 2);
4487: 
4488:     octx.stroke();
4489: 
4490:     const angle = i * 0.8 + 1.2;
4491: 
4492:     const dotX = cx + Math.cos(angle) * radius;
4493: 
4494:     const dotY = cy + Math.sin(angle) * radius;
4495: 
4496:     if (i === orbitNum) {
4497: 
4498:       octx.fillStyle = themeColor;
4499: 
4500:       octx.shadowColor = themeColor;
4501: 
4502:       octx.shadowBlur = 6;
4503: 
4504:       octx.beginPath();
4505: 
4506:       octx.arc(dotX, dotY, 3.0, 0, Math.PI * 2);
4507: 
4508:       octx.fill();
4509: 
4510:       octx.shadowBlur = 0;
4511: 
4512:     } else {
4513: 
4514:       octx.fillStyle = 'rgba(255,255,255,0.18)';
4515: 
4516:       octx.beginPath();
4517: 
4518:       octx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
4519: 
4520:       octx.fill();
4521: 
4522:     }
4523: 
4524:   }
4525: 
4526: }
4527: 
4528: function showPoster(s) {
4529: 
4530:   const overlay = document.getElementById('poster-overlay');
4531: 
4532:   const body = document.getElementById('poster-info-body');
4533: 
4534:   const c = ORBIT_COLORS[s.orbit];
4535: 
4536:   const orbitColor = `hsl(${c.h},${c.s}%,${c.l}%)`;
4537: 
4538:   const orbitColorGlow = `hsla(${c.h},${c.s}%,${c.l}%,0.3)`;
4539: 
4540:   // 设置 CSS 变量，使卡片边框及发光与科学家对应轨道颜色一致
4541: 
4542:   overlay.style.setProperty('--orbit-color', orbitColor);
4543: 
4544:   overlay.style.setProperty('--orbit-glow', orbitColorGlow);
4545: 
4546:   // 提取英文名
4547: 
4548:   let enName = '';
4549: 
4550:   const match = s.name.match(/[\s(（]([A-Za-z\s&._-]+)/);
4551: 
4552:   if (match && match[1]) {
4553: 
4554:     enName = match[1].trim();
4555: 
4556:   } else {
4557: 
4558:     enName = s.id.replace(/_/g, ' ');
4559: 
4560:   }
4561: 
4562:   document.getElementById('poster-name-en').textContent = enName.toUpperCase();
4563: 
4564:   document.getElementById('poster-name-cn').textContent = s._cnName;
4565: 
4566:   // 4角元数据设置
4567: 
4568:   document.getElementById('meta-era').textContent = s.era || "未知时代";
4569: 
4570:   document.getElementById('meta-nationality').textContent = s.nationality || "未知国籍";
4571: 
4572:   document.getElementById('meta-priority').textContent = s.priority || "常规考点";
4573: 
4574:   document.getElementById('meta-sector').textContent = ORBIT_LABELS[s.orbit];
4575: 
4576:   // 表格参数计算与填充
4577: 
4578:   document.getElementById('table-center-icon').textContent = ORBIT_CENTER_ICONS[s.orbit] || '🧬';
4579: 
4580:   document.getElementById('val-magnitude').textContent = `${s.magnitude} / 5`;
4581: 
4582:   document.getElementById('val-stars').textContent = '★'.repeat(s.magnitude) + '☆'.repeat(5 - s.magnitude);
4583: 
4584:   const cogType = s.cognitive_type || "实验观察/实证分析";
4585: 
4586:   const cogParts = cogType.split('/');
4587: 
4588:   document.getElementById('val-cognitive-cn').textContent = cogParts[0] || "实验观察";
4589: 
4590:   document.getElementById('val-cognitive-en').textContent = cogParts[1] || "实证分析";
4591: 
4592:   document.getElementById('val-module').textContent = s.knowledge_module || "经典发现";
4593: 
4594:   document.getElementById('val-books').textContent = s.books && s.books.length ? s.books.join(', ') : "高中生物";
4595: 
4596:   // 绘制迷你轨道图
4597: 
4598:   drawMiniOrbit(s.orbit);
4599: 
4600:   // 关联科学家 vs 关联故事
