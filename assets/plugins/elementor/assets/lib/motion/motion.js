(function(global,factory){typeof exports==='object'&&typeof module!=='undefined'?factory(exports):typeof define==='function'&&define.amd?define(['exports'],factory):(global=typeof globalThis!=='undefined'?globalThis:global||self,factory(global.Motion={}));})(this,(function(exports){'use strict';function addUniqueItem(arr,item){if(arr.indexOf(item)===-1)
arr.push(item);}
function removeItem(arr,item){const index=arr.indexOf(item);if(index>-1)
arr.splice(index,1);}
function moveItem([...arr],fromIndex,toIndex){const startIndex=fromIndex<0?arr.length+fromIndex:fromIndex;if(startIndex>=0&&startIndex<arr.length){const endIndex=toIndex<0?arr.length+toIndex:toIndex;const[item]=arr.splice(fromIndex,1);arr.splice(endIndex,0,item);}
return arr;}
const clamp=(min,max,v)=>{if(v>max)
return max;if(v<min)
return min;return v;};function formatErrorMessage(message,errorCode){return errorCode?`${message}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${errorCode}`:message;}
exports.warning=()=>{};exports.invariant=()=>{};{exports.warning=(check,message,errorCode)=>{if(!check&&typeof console!=="undefined"){console.warn(formatErrorMessage(message,errorCode));}};exports.invariant=(check,message,errorCode)=>{if(!check){throw new Error(formatErrorMessage(message,errorCode));}};}
const MotionGlobalConfig={};const isNumericalString=(v)=>/^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(v);function isObject(value){return typeof value==="object"&&value!==null;}
const isZeroValueString=(v)=>/^0[^.\s]+$/u.test(v);function memo(callback){let result;return()=>{if(result===undefined)
result=callback();return result;};}
const noop=(any)=>any;const combineFunctions=(a,b)=>(v)=>b(a(v));const pipe=(...transformers)=>transformers.reduce(combineFunctions);const progress=(from,to,value)=>{const toFromDifference=to-from;return toFromDifference===0?1:(value-from)/ toFromDifference;};class SubscriptionManager{constructor(){this.subscriptions=[];}
add(handler){addUniqueItem(this.subscriptions,handler);return()=>removeItem(this.subscriptions,handler);}
notify(a,b,c){const numSubscriptions=this.subscriptions.length;if(!numSubscriptions)
return;if(numSubscriptions===1){this.subscriptions[0](a,b,c);}
else{for(let i=0;i<numSubscriptions;i++){const handler=this.subscriptions[i];handler&&handler(a,b,c);}}}
getSize(){return this.subscriptions.length;}
clear(){this.subscriptions.length=0;}}
const secondsToMilliseconds=(seconds)=>seconds*1000;const millisecondsToSeconds=(milliseconds)=>milliseconds / 1000;function velocityPerSecond(velocity,frameDuration){return frameDuration?velocity*(1000 / frameDuration):0;}
const warned=new Set();function hasWarned(message){return warned.has(message);}
function warnOnce(condition,message,errorCode){if(condition||warned.has(message))
return;console.warn(formatErrorMessage(message,errorCode));warned.add(message);}
const wrap=(min,max,v)=>{const rangeSize=max-min;return((((v-min)%rangeSize)+rangeSize)%rangeSize)+min;};const calcBezier=(t,a1,a2)=>(((1.0-3.0*a2+3.0*a1)*t+(3.0*a2-6.0*a1))*t+3.0*a1)*t;const subdivisionPrecision=0.0000001;const subdivisionMaxIterations=12;function binarySubdivide(x,lowerBound,upperBound,mX1,mX2){let currentX;let currentT;let i=0;do{currentT=lowerBound+(upperBound-lowerBound)/ 2.0;currentX=calcBezier(currentT,mX1,mX2)-x;if(currentX>0.0){upperBound=currentT;}
else{lowerBound=currentT;}}while(Math.abs(currentX)>subdivisionPrecision&&++i<subdivisionMaxIterations);return currentT;}
function cubicBezier(mX1,mY1,mX2,mY2){if(mX1===mY1&&mX2===mY2)
return noop;const getTForX=(aX)=>binarySubdivide(aX,0,1,mX1,mX2);return(t)=>t===0||t===1?t:calcBezier(getTForX(t),mY1,mY2);}
const mirrorEasing=(easing)=>(p)=>p<=0.5?easing(2*p)/ 2:(2-easing(2*(1-p)))/ 2;const reverseEasing=(easing)=>(p)=>1-easing(1-p);const backOut=/*@__PURE__*/ cubicBezier(0.33,1.53,0.69,0.99);const backIn=/*@__PURE__*/ reverseEasing(backOut);const backInOut=/*@__PURE__*/ mirrorEasing(backIn);const anticipate=(p)=>(p*=2)<1?0.5*backIn(p):0.5*(2-Math.pow(2,-10*(p-1)));const circIn=(p)=>1-Math.sin(Math.acos(p));const circOut=reverseEasing(circIn);const circInOut=mirrorEasing(circIn);const easeIn=/*@__PURE__*/ cubicBezier(0.42,0,1,1);const easeOut=/*@__PURE__*/ cubicBezier(0,0,0.58,1);const easeInOut=/*@__PURE__*/ cubicBezier(0.42,0,0.58,1);function steps(numSteps,direction="end"){return(progress)=>{progress=direction==="end"?Math.min(progress,0.999):Math.max(progress,0.001);const expanded=progress*numSteps;const rounded=direction==="end"?Math.floor(expanded):Math.ceil(expanded);return clamp(0,1,rounded / numSteps);};}
const isEasingArray=(ease)=>{return Array.isArray(ease)&&typeof ease[0]!=="number";};function getEasingForSegment(easing,i){return isEasingArray(easing)?easing[wrap(0,easing.length,i)]:easing;}
const isBezierDefinition=(easing)=>Array.isArray(easing)&&typeof easing[0]==="number";const easingLookup={linear:noop,easeIn,easeInOut,easeOut,circIn,circInOut,circOut,backIn,backInOut,backOut,anticipate,};const isValidEasing=(easing)=>{return typeof easing==="string";};const easingDefinitionToFunction=(definition)=>{if(isBezierDefinition(definition)){exports.invariant(definition.length===4,`Cubic bezier arrays must contain four numerical values.`,"cubic-bezier-length");const[x1,y1,x2,y2]=definition;return cubicBezier(x1,y1,x2,y2);}
else if(isValidEasing(definition)){exports.invariant(easingLookup[definition]!==undefined,`Invalid easing type '${definition}'`,"invalid-easing-type");return easingLookup[definition];}
return definition;};const stepsOrder=["setup","read","resolveKeyframes","preUpdate","update","preRender","render","postRender",];const statsBuffer={value:null,addProjectionMetrics:null,};function createRenderStep(runNextFrame,stepName){let thisFrame=new Set();let nextFrame=new Set();let isProcessing=false;let flushNextFrame=false;const toKeepAlive=new WeakSet();let latestFrameData={delta:0.0,timestamp:0.0,isProcessing:false,};let numCalls=0;function triggerCallback(callback){if(toKeepAlive.has(callback)){step.schedule(callback);runNextFrame();}
numCalls++;callback(latestFrameData);}
const step={schedule:(callback,keepAlive=false,immediate=false)=>{const addToCurrentFrame=immediate&&isProcessing;const queue=addToCurrentFrame?thisFrame:nextFrame;if(keepAlive)
toKeepAlive.add(callback);if(!queue.has(callback))
queue.add(callback);return callback;},cancel:(callback)=>{nextFrame.delete(callback);toKeepAlive.delete(callback);},process:(frameData)=>{latestFrameData=frameData;if(isProcessing){flushNextFrame=true;return;}
isProcessing=true;[thisFrame,nextFrame]=[nextFrame,thisFrame];thisFrame.forEach(triggerCallback);if(stepName&&statsBuffer.value){statsBuffer.value.frameloop[stepName].push(numCalls);}
numCalls=0;thisFrame.clear();isProcessing=false;if(flushNextFrame){flushNextFrame=false;step.process(frameData);}},};return step;}
const maxElapsed$1=40;function createRenderBatcher(scheduleNextBatch,allowKeepAlive){let runNextFrame=false;let useDefaultElapsed=true;const state={delta:0.0,timestamp:0.0,isProcessing:false,};const flagRunNextFrame=()=>(runNextFrame=true);const steps=stepsOrder.reduce((acc,key)=>{acc[key]=createRenderStep(flagRunNextFrame,allowKeepAlive?key:undefined);return acc;},{});const{setup,read,resolveKeyframes,preUpdate,update,preRender,render,postRender,}=steps;const processBatch=()=>{const timestamp=MotionGlobalConfig.useManualTiming?state.timestamp:performance.now();runNextFrame=false;if(!MotionGlobalConfig.useManualTiming){state.delta=useDefaultElapsed?1000 / 60:Math.max(Math.min(timestamp-state.timestamp,maxElapsed$1),1);}
state.timestamp=timestamp;state.isProcessing=true;setup.process(state);read.process(state);resolveKeyframes.process(state);preUpdate.process(state);update.process(state);preRender.process(state);render.process(state);postRender.process(state);state.isProcessing=false;if(runNextFrame&&allowKeepAlive){useDefaultElapsed=false;scheduleNextBatch(processBatch);}};const wake=()=>{runNextFrame=true;useDefaultElapsed=true;if(!state.isProcessing){scheduleNextBatch(processBatch);}};const schedule=stepsOrder.reduce((acc,key)=>{const step=steps[key];acc[key]=(process,keepAlive=false,immediate=false)=>{if(!runNextFrame)
wake();return step.schedule(process,keepAlive,immediate);};return acc;},{});const cancel=(process)=>{for(let i=0;i<stepsOrder.length;i++){steps[stepsOrder[i]].cancel(process);}};return{schedule,cancel,state,steps};}
const{schedule:frame,cancel:cancelFrame,state:frameData,steps:frameSteps,}=createRenderBatcher(typeof requestAnimationFrame!=="undefined"?requestAnimationFrame:noop,true);let now;function clearTime(){now=undefined;}
const time={now:()=>{if(now===undefined){time.set(frameData.isProcessing||MotionGlobalConfig.useManualTiming?frameData.timestamp:performance.now());}
return now;},set:(newTime)=>{now=newTime;queueMicrotask(clearTime);},};const activeAnimations={layout:0,mainThread:0,waapi:0,};const checkStringStartsWith=(token)=>(key)=>typeof key==="string"&&key.startsWith(token);const isCSSVariableName=/*@__PURE__*/ checkStringStartsWith("--");const startsAsVariableToken=/*@__PURE__*/ checkStringStartsWith("var(--");const isCSSVariableToken=(value)=>{const startsWithToken=startsAsVariableToken(value);if(!startsWithToken)
return false;return singleCssVariableRegex.test(value.split("/*")[0].trim());};const singleCssVariableRegex=/var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;const number={test:(v)=>typeof v==="number",parse:parseFloat,transform:(v)=>v,};const alpha={...number,transform:(v)=>clamp(0,1,v),};const scale={...number,default:1,};const sanitize=(v)=>Math.round(v*100000)/ 100000;const floatRegex=/-?(?:\d+(?:\.\d+)?|\.\d+)/gu;function isNullish(v){return v==null;}
const singleColorRegex=/^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu;const isColorString=(type,testProp)=>(v)=>{return Boolean((typeof v==="string"&&singleColorRegex.test(v)&&v.startsWith(type))||(testProp&&!isNullish(v)&&Object.prototype.hasOwnProperty.call(v,testProp)));};const splitColor=(aName,bName,cName)=>(v)=>{if(typeof v!=="string")
return v;const[a,b,c,alpha]=v.match(floatRegex);return{[aName]:parseFloat(a),[bName]:parseFloat(b),[cName]:parseFloat(c),alpha:alpha!==undefined?parseFloat(alpha):1,};};const clampRgbUnit=(v)=>clamp(0,255,v);const rgbUnit={...number,transform:(v)=>Math.round(clampRgbUnit(v)),};const rgba={test:/*@__PURE__*/ isColorString("rgb","red"),parse:/*@__PURE__*/ splitColor("red","green","blue"),transform:({red,green,blue,alpha:alpha$1=1})=>"rgba("+
rgbUnit.transform(red)+", "+
rgbUnit.transform(green)+", "+
rgbUnit.transform(blue)+", "+
sanitize(alpha.transform(alpha$1))+")",};function parseHex(v){let r="";let g="";let b="";let a="";if(v.length>5){r=v.substring(1,3);g=v.substring(3,5);b=v.substring(5,7);a=v.substring(7,9);}
else{r=v.substring(1,2);g=v.substring(2,3);b=v.substring(3,4);a=v.substring(4,5);r+=r;g+=g;b+=b;a+=a;}
return{red:parseInt(r,16),green:parseInt(g,16),blue:parseInt(b,16),alpha:a?parseInt(a,16)/ 255:1,};}
const hex={test:/*@__PURE__*/ isColorString("#"),parse:parseHex,transform:rgba.transform,};const createUnitType=(unit)=>({test:(v)=>typeof v==="string"&&v.endsWith(unit)&&v.split(" ").length===1,parse:parseFloat,transform:(v)=>`${v}${unit}`,});const degrees=/*@__PURE__*/ createUnitType("deg");const percent=/*@__PURE__*/ createUnitType("%");const px=/*@__PURE__*/ createUnitType("px");const vh=/*@__PURE__*/ createUnitType("vh");const vw=/*@__PURE__*/ createUnitType("vw");const progressPercentage=/*@__PURE__*/(()=>({...percent,parse:(v)=>percent.parse(v)/ 100,transform:(v)=>percent.transform(v*100),}))();const hsla={test:/*@__PURE__*/ isColorString("hsl","hue"),parse:/*@__PURE__*/ splitColor("hue","saturation","lightness"),transform:({hue,saturation,lightness,alpha:alpha$1=1})=>{return("hsla("+
Math.round(hue)+", "+
percent.transform(sanitize(saturation))+", "+
percent.transform(sanitize(lightness))+", "+
sanitize(alpha.transform(alpha$1))+")");},};const color={test:(v)=>rgba.test(v)||hex.test(v)||hsla.test(v),parse:(v)=>{if(rgba.test(v)){return rgba.parse(v);}
else if(hsla.test(v)){return hsla.parse(v);}
else{return hex.parse(v);}},transform:(v)=>{return typeof v==="string"?v:v.hasOwnProperty("red")?rgba.transform(v):hsla.transform(v);},getAnimatableNone:(v)=>{const parsed=color.parse(v);parsed.alpha=0;return color.transform(parsed);},};const colorRegex=/(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;function test(v){return(isNaN(v)&&typeof v==="string"&&(v.match(floatRegex)?.length||0)+
(v.match(colorRegex)?.length||0)>0);}
const NUMBER_TOKEN="number";const COLOR_TOKEN="color";const VAR_TOKEN="var";const VAR_FUNCTION_TOKEN="var(";const SPLIT_TOKEN="${}";const complexRegex=/var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;function analyseComplexValue(value){const originalValue=value.toString();const values=[];const indexes={color:[],number:[],var:[],};const types=[];let i=0;const tokenised=originalValue.replace(complexRegex,(parsedValue)=>{if(color.test(parsedValue)){indexes.color.push(i);types.push(COLOR_TOKEN);values.push(color.parse(parsedValue));}
else if(parsedValue.startsWith(VAR_FUNCTION_TOKEN)){indexes.var.push(i);types.push(VAR_TOKEN);values.push(parsedValue);}
else{indexes.number.push(i);types.push(NUMBER_TOKEN);values.push(parseFloat(parsedValue));}
++i;return SPLIT_TOKEN;});const split=tokenised.split(SPLIT_TOKEN);return{values,split,indexes,types};}
function parseComplexValue(v){return analyseComplexValue(v).values;}
function createTransformer(source){const{split,types}=analyseComplexValue(source);const numSections=split.length;return(v)=>{let output="";for(let i=0;i<numSections;i++){output+=split[i];if(v[i]!==undefined){const type=types[i];if(type===NUMBER_TOKEN){output+=sanitize(v[i]);}
else if(type===COLOR_TOKEN){output+=color.transform(v[i]);}
else{output+=v[i];}}}
return output;};}
const convertNumbersToZero=(v)=>typeof v==="number"?0:color.test(v)?color.getAnimatableNone(v):v;function getAnimatableNone$1(v){const parsed=parseComplexValue(v);const transformer=createTransformer(v);return transformer(parsed.map(convertNumbersToZero));}
const complex={test,parse:parseComplexValue,createTransformer,getAnimatableNone:getAnimatableNone$1,};function hueToRgb(p,q,t){if(t<0)
t+=1;if(t>1)
t-=1;if(t<1 / 6)
return p+(q-p)*6*t;if(t<1 / 2)
return q;if(t<2 / 3)
return p+(q-p)*(2 / 3-t)*6;return p;}
function hslaToRgba({hue,saturation,lightness,alpha}){hue /=360;saturation /=100;lightness /=100;let red=0;let green=0;let blue=0;if(!saturation){red=green=blue=lightness;}
else{const q=lightness<0.5?lightness*(1+saturation):lightness+saturation-lightness*saturation;const p=2*lightness-q;red=hueToRgb(p,q,hue+1 / 3);green=hueToRgb(p,q,hue);blue=hueToRgb(p,q,hue-1 / 3);}
return{red:Math.round(red*255),green:Math.round(green*255),blue:Math.round(blue*255),alpha,};}
function mixImmediate(a,b){return(p)=>(p>0?b:a);}
const mixNumber$1=(from,to,progress)=>{return from+(to-from)*progress;};const mixLinearColor=(from,to,v)=>{const fromExpo=from*from;const expo=v*(to*to-fromExpo)+fromExpo;return expo<0?0:Math.sqrt(expo);};const colorTypes=[hex,rgba,hsla];const getColorType=(v)=>colorTypes.find((type)=>type.test(v));function asRGBA(color){const type=getColorType(color);exports.warning(Boolean(type),`'${color}' is not an animatable color. Use the equivalent color code instead.`,"color-not-animatable");if(!Boolean(type))
return false;let model=type.parse(color);if(type===hsla){model=hslaToRgba(model);}
return model;}
const mixColor=(from,to)=>{const fromRGBA=asRGBA(from);const toRGBA=asRGBA(to);if(!fromRGBA||!toRGBA){return mixImmediate(from,to);}
const blended={...fromRGBA};return(v)=>{blended.red=mixLinearColor(fromRGBA.red,toRGBA.red,v);blended.green=mixLinearColor(fromRGBA.green,toRGBA.green,v);blended.blue=mixLinearColor(fromRGBA.blue,toRGBA.blue,v);blended.alpha=mixNumber$1(fromRGBA.alpha,toRGBA.alpha,v);return rgba.transform(blended);};};const invisibleValues=new Set(["none","hidden"]);function mixVisibility(origin,target){if(invisibleValues.has(origin)){return(p)=>(p<=0?origin:target);}
else{return(p)=>(p>=1?target:origin);}}
function mixNumber(a,b){return(p)=>mixNumber$1(a,b,p);}
function getMixer(a){if(typeof a==="number"){return mixNumber;}
else if(typeof a==="string"){return isCSSVariableToken(a)?mixImmediate:color.test(a)?mixColor:mixComplex;}
else if(Array.isArray(a)){return mixArray;}
else if(typeof a==="object"){return color.test(a)?mixColor:mixObject;}
return mixImmediate;}
function mixArray(a,b){const output=[...a];const numValues=output.length;const blendValue=a.map((v,i)=>getMixer(v)(v,b[i]));return(p)=>{for(let i=0;i<numValues;i++){output[i]=blendValue[i](p);}
return output;};}
function mixObject(a,b){const output={...a,...b};const blendValue={};for(const key in output){if(a[key]!==undefined&&b[key]!==undefined){blendValue[key]=getMixer(a[key])(a[key],b[key]);}}
return(v)=>{for(const key in blendValue){output[key]=blendValue[key](v);}
return output;};}
function matchOrder(origin,target){const orderedOrigin=[];const pointers={color:0,var:0,number:0};for(let i=0;i<target.values.length;i++){const type=target.types[i];const originIndex=origin.indexes[type][pointers[type]];const originValue=origin.values[originIndex]??0;orderedOrigin[i]=originValue;pointers[type]++;}
return orderedOrigin;}
const mixComplex=(origin,target)=>{const template=complex.createTransformer(target);const originStats=analyseComplexValue(origin);const targetStats=analyseComplexValue(target);const canInterpolate=originStats.indexes.var.length===targetStats.indexes.var.length&&originStats.indexes.color.length===targetStats.indexes.color.length&&originStats.indexes.number.length>=targetStats.indexes.number.length;if(canInterpolate){if((invisibleValues.has(origin)&&!targetStats.values.length)||(invisibleValues.has(target)&&!originStats.values.length)){return mixVisibility(origin,target);}
return pipe(mixArray(matchOrder(originStats,targetStats),targetStats.values),template);}
else{exports.warning(true,`Complex values '${origin}' and '${target}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`,"complex-values-different");return mixImmediate(origin,target);}};function mix(from,to,p){if(typeof from==="number"&&typeof to==="number"&&typeof p==="number"){return mixNumber$1(from,to,p);}
const mixer=getMixer(from);return mixer(from,to);}
const frameloopDriver=(update)=>{const passTimestamp=({timestamp})=>update(timestamp);return{start:(keepAlive=true)=>frame.update(passTimestamp,keepAlive),stop:()=>cancelFrame(passTimestamp),now:()=>(frameData.isProcessing?frameData.timestamp:time.now()),};};const generateLinearEasing=(easing,duration,resolution=10)=>{let points="";const numPoints=Math.max(Math.round(duration / resolution),2);for(let i=0;i<numPoints;i++){points+=Math.round(easing(i /(numPoints-1))*10000)/ 10000+", ";}
return`linear(${points.substring(0, points.length - 2)})`;};const maxGeneratorDuration=20000;function calcGeneratorDuration(generator){let duration=0;const timeStep=50;let state=generator.next(duration);while(!state.done&&duration<maxGeneratorDuration){duration+=timeStep;state=generator.next(duration);}
return duration>=maxGeneratorDuration?Infinity:duration;}
function createGeneratorEasing(options,scale=100,createGenerator){const generator=createGenerator({...options,keyframes:[0,scale]});const duration=Math.min(calcGeneratorDuration(generator),maxGeneratorDuration);return{type:"keyframes",ease:(progress)=>{return generator.next(duration*progress).value / scale;},duration:millisecondsToSeconds(duration),};}
const velocitySampleDuration=5;function calcGeneratorVelocity(resolveValue,t,current){const prevT=Math.max(t-velocitySampleDuration,0);return velocityPerSecond(current-resolveValue(prevT),t-prevT);}
const springDefaults={stiffness:100,damping:10,mass:1.0,velocity:0.0,duration:800,bounce:0.3,visualDuration:0.3,restSpeed:{granular:0.01,default:2,},restDelta:{granular:0.005,default:0.5,},minDuration:0.01,maxDuration:10.0,minDamping:0.05,maxDamping:1,};const safeMin=0.001;function findSpring({duration=springDefaults.duration,bounce=springDefaults.bounce,velocity=springDefaults.velocity,mass=springDefaults.mass,}){let envelope;let derivative;exports.warning(duration<=secondsToMilliseconds(springDefaults.maxDuration),"Spring duration must be 10 seconds or less","spring-duration-limit");let dampingRatio=1-bounce;dampingRatio=clamp(springDefaults.minDamping,springDefaults.maxDamping,dampingRatio);duration=clamp(springDefaults.minDuration,springDefaults.maxDuration,millisecondsToSeconds(duration));if(dampingRatio<1){envelope=(undampedFreq)=>{const exponentialDecay=undampedFreq*dampingRatio;const delta=exponentialDecay*duration;const a=exponentialDecay-velocity;const b=calcAngularFreq(undampedFreq,dampingRatio);const c=Math.exp(-delta);return safeMin-(a / b)*c;};derivative=(undampedFreq)=>{const exponentialDecay=undampedFreq*dampingRatio;const delta=exponentialDecay*duration;const d=delta*velocity+velocity;const e=Math.pow(dampingRatio,2)*Math.pow(undampedFreq,2)*duration;const f=Math.exp(-delta);const g=calcAngularFreq(Math.pow(undampedFreq,2),dampingRatio);const factor=-envelope(undampedFreq)+safeMin>0?-1:1;return(factor*((d-e)*f))/ g;};}
else{envelope=(undampedFreq)=>{const a=Math.exp(-undampedFreq*duration);const b=(undampedFreq-velocity)*duration+1;return-safeMin+a*b;};derivative=(undampedFreq)=>{const a=Math.exp(-undampedFreq*duration);const b=(velocity-undampedFreq)*(duration*duration);return a*b;};}
const initialGuess=5 / duration;const undampedFreq=approximateRoot(envelope,derivative,initialGuess);duration=secondsToMilliseconds(duration);if(isNaN(undampedFreq)){return{stiffness:springDefaults.stiffness,damping:springDefaults.damping,duration,};}
else{const stiffness=Math.pow(undampedFreq,2)*mass;return{stiffness,damping:dampingRatio*2*Math.sqrt(mass*stiffness),duration,};}}
const rootIterations=12;function approximateRoot(envelope,derivative,initialGuess){let result=initialGuess;for(let i=1;i<rootIterations;i++){result=result-envelope(result)/ derivative(result);}
return result;}
function calcAngularFreq(undampedFreq,dampingRatio){return undampedFreq*Math.sqrt(1-dampingRatio*dampingRatio);}
const durationKeys=["duration","bounce"];const physicsKeys=["stiffness","damping","mass"];function isSpringType(options,keys){return keys.some((key)=>options[key]!==undefined);}
function getSpringOptions(options){let springOptions={velocity:springDefaults.velocity,stiffness:springDefaults.stiffness,damping:springDefaults.damping,mass:springDefaults.mass,isResolvedFromDuration:false,...options,};if(!isSpringType(options,physicsKeys)&&isSpringType(options,durationKeys)){if(options.visualDuration){const visualDuration=options.visualDuration;const root=(2*Math.PI)/(visualDuration*1.2);const stiffness=root*root;const damping=2*clamp(0.05,1,1-(options.bounce||0))*Math.sqrt(stiffness);springOptions={...springOptions,mass:springDefaults.mass,stiffness,damping,};}
else{const derived=findSpring(options);springOptions={...springOptions,...derived,mass:springDefaults.mass,};springOptions.isResolvedFromDuration=true;}}
return springOptions;}
function spring(optionsOrVisualDuration=springDefaults.visualDuration,bounce=springDefaults.bounce){const options=typeof optionsOrVisualDuration!=="object"?{visualDuration:optionsOrVisualDuration,keyframes:[0,1],bounce,}:optionsOrVisualDuration;let{restSpeed,restDelta}=options;const origin=options.keyframes[0];const target=options.keyframes[options.keyframes.length-1];const state={done:false,value:origin};const{stiffness,damping,mass,duration,velocity,isResolvedFromDuration,}=getSpringOptions({...options,velocity:-millisecondsToSeconds(options.velocity||0),});const initialVelocity=velocity||0.0;const dampingRatio=damping /(2*Math.sqrt(stiffness*mass));const initialDelta=target-origin;const undampedAngularFreq=millisecondsToSeconds(Math.sqrt(stiffness / mass));const isGranularScale=Math.abs(initialDelta)<5;restSpeed||(restSpeed=isGranularScale?springDefaults.restSpeed.granular:springDefaults.restSpeed.default);restDelta||(restDelta=isGranularScale?springDefaults.restDelta.granular:springDefaults.restDelta.default);let resolveSpring;if(dampingRatio<1){const angularFreq=calcAngularFreq(undampedAngularFreq,dampingRatio);resolveSpring=(t)=>{const envelope=Math.exp(-dampingRatio*undampedAngularFreq*t);return(target-
envelope*(((initialVelocity+
dampingRatio*undampedAngularFreq*initialDelta)/
angularFreq)*Math.sin(angularFreq*t)+
initialDelta*Math.cos(angularFreq*t)));};}
else if(dampingRatio===1){resolveSpring=(t)=>target-
Math.exp(-undampedAngularFreq*t)*(initialDelta+
(initialVelocity+undampedAngularFreq*initialDelta)*t);}
else{const dampedAngularFreq=undampedAngularFreq*Math.sqrt(dampingRatio*dampingRatio-1);resolveSpring=(t)=>{const envelope=Math.exp(-dampingRatio*undampedAngularFreq*t);const freqForT=Math.min(dampedAngularFreq*t,300);return(target-
(envelope*((initialVelocity+
dampingRatio*undampedAngularFreq*initialDelta)*Math.sinh(freqForT)+
dampedAngularFreq*initialDelta*Math.cosh(freqForT)))/
dampedAngularFreq);};}
const generator={calculatedDuration:isResolvedFromDuration?duration||null:null,next:(t)=>{const current=resolveSpring(t);if(!isResolvedFromDuration){let currentVelocity=t===0?initialVelocity:0.0;if(dampingRatio<1){currentVelocity=t===0?secondsToMilliseconds(initialVelocity):calcGeneratorVelocity(resolveSpring,t,current);}
const isBelowVelocityThreshold=Math.abs(currentVelocity)<=restSpeed;const isBelowDisplacementThreshold=Math.abs(target-current)<=restDelta;state.done=isBelowVelocityThreshold&&isBelowDisplacementThreshold;}
else{state.done=t>=duration;}
state.value=state.done?target:current;return state;},toString:()=>{const calculatedDuration=Math.min(calcGeneratorDuration(generator),maxGeneratorDuration);const easing=generateLinearEasing((progress)=>generator.next(calculatedDuration*progress).value,calculatedDuration,30);return calculatedDuration+"ms "+easing;},toTransition:()=>{},};return generator;}
spring.applyToOptions=(options)=>{const generatorOptions=createGeneratorEasing(options,100,spring);options.ease=generatorOptions.ease;options.duration=secondsToMilliseconds(generatorOptions.duration);options.type="keyframes";return options;};function inertia({keyframes,velocity=0.0,power=0.8,timeConstant=325,bounceDamping=10,bounceStiffness=500,modifyTarget,min,max,restDelta=0.5,restSpeed,}){const origin=keyframes[0];const state={done:false,value:origin,};const isOutOfBounds=(v)=>(min!==undefined&&v<min)||(max!==undefined&&v>max);const nearestBoundary=(v)=>{if(min===undefined)
return max;if(max===undefined)
return min;return Math.abs(min-v)<Math.abs(max-v)?min:max;};let amplitude=power*velocity;const ideal=origin+amplitude;const target=modifyTarget===undefined?ideal:modifyTarget(ideal);if(target!==ideal)
amplitude=target-origin;const calcDelta=(t)=>-amplitude*Math.exp(-t / timeConstant);const calcLatest=(t)=>target+calcDelta(t);const applyFriction=(t)=>{const delta=calcDelta(t);const latest=calcLatest(t);state.done=Math.abs(delta)<=restDelta;state.value=state.done?target:latest;};let timeReachedBoundary;let spring$1;const checkCatchBoundary=(t)=>{if(!isOutOfBounds(state.value))
return;timeReachedBoundary=t;spring$1=spring({keyframes:[state.value,nearestBoundary(state.value)],velocity:calcGeneratorVelocity(calcLatest,t,state.value),damping:bounceDamping,stiffness:bounceStiffness,restDelta,restSpeed,});};checkCatchBoundary(0);return{calculatedDuration:null,next:(t)=>{let hasUpdatedFrame=false;if(!spring$1&&timeReachedBoundary===undefined){hasUpdatedFrame=true;applyFriction(t);checkCatchBoundary(t);}
if(timeReachedBoundary!==undefined&&t>=timeReachedBoundary){return spring$1.next(t-timeReachedBoundary);}
else{!hasUpdatedFrame&&applyFriction(t);return state;}},};}
function createMixers(output,ease,customMixer){const mixers=[];const mixerFactory=customMixer||MotionGlobalConfig.mix||mix;const numMixers=output.length-1;for(let i=0;i<numMixers;i++){let mixer=mixerFactory(output[i],output[i+1]);if(ease){const easingFunction=Array.isArray(ease)?ease[i]||noop:ease;mixer=pipe(easingFunction,mixer);}
mixers.push(mixer);}
return mixers;}
function interpolate(input,output,{clamp:isClamp=true,ease,mixer}={}){const inputLength=input.length;exports.invariant(inputLength===output.length,"Both input and output ranges must be the same length","range-length");if(inputLength===1)
return()=>output[0];if(inputLength===2&&output[0]===output[1])
return()=>output[1];const isZeroDeltaRange=input[0]===input[1];if(input[0]>input[inputLength-1]){input=[...input].reverse();output=[...output].reverse();}
const mixers=createMixers(output,ease,mixer);const numMixers=mixers.length;const interpolator=(v)=>{if(isZeroDeltaRange&&v<input[0])
return output[0];let i=0;if(numMixers>1){for(;i<input.length-2;i++){if(v<input[i+1])
break;}}
const progressInRange=progress(input[i],input[i+1],v);return mixers[i](progressInRange);};return isClamp?(v)=>interpolator(clamp(input[0],input[inputLength-1],v)):interpolator;}
function fillOffset(offset,remaining){const min=offset[offset.length-1];for(let i=1;i<=remaining;i++){const offsetProgress=progress(0,remaining,i);offset.push(mixNumber$1(min,1,offsetProgress));}}
function defaultOffset$1(arr){const offset=[0];fillOffset(offset,arr.length-1);return offset;}
function convertOffsetToTimes(offset,duration){return offset.map((o)=>o*duration);}
function defaultEasing(values,easing){return values.map(()=>easing||easeInOut).splice(0,values.length-1);}
function keyframes({duration=300,keyframes:keyframeValues,times,ease="easeInOut",}){const easingFunctions=isEasingArray(ease)?ease.map(easingDefinitionToFunction):easingDefinitionToFunction(ease);const state={done:false,value:keyframeValues[0],};const absoluteTimes=convertOffsetToTimes(times&&times.length===keyframeValues.length?times:defaultOffset$1(keyframeValues),duration);const mapTimeToKeyframe=interpolate(absoluteTimes,keyframeValues,{ease:Array.isArray(easingFunctions)?easingFunctions:defaultEasing(keyframeValues,easingFunctions),});return{calculatedDuration:duration,next:(t)=>{state.value=mapTimeToKeyframe(t);state.done=t>=duration;return state;},};}
const isNotNull$1=(value)=>value!==null;function getFinalKeyframe$1(keyframes,{repeat,repeatType="loop"},finalKeyframe,speed=1){const resolvedKeyframes=keyframes.filter(isNotNull$1);const useFirstKeyframe=speed<0||(repeat&&repeatType!=="loop"&&repeat%2===1);const index=useFirstKeyframe?0:resolvedKeyframes.length-1;return!index||finalKeyframe===undefined?resolvedKeyframes[index]:finalKeyframe;}
const transitionTypeMap={decay:inertia,inertia,tween:keyframes,keyframes:keyframes,spring,};function replaceTransitionType(transition){if(typeof transition.type==="string"){transition.type=transitionTypeMap[transition.type];}}
class WithPromise{constructor(){this.updateFinished();}
get finished(){return this._finished;}
updateFinished(){this._finished=new Promise((resolve)=>{this.resolve=resolve;});}
notifyFinished(){this.resolve();}
then(onResolve,onReject){return this.finished.then(onResolve,onReject);}}
const percentToProgress=(percent)=>percent / 100;class JSAnimation extends WithPromise{constructor(options){super();this.state="idle";this.startTime=null;this.isStopped=false;this.currentTime=0;this.holdTime=null;this.playbackSpeed=1;this.stop=()=>{const{motionValue}=this.options;if(motionValue&&motionValue.updatedAt!==time.now()){this.tick(time.now());}
this.isStopped=true;if(this.state==="idle")
return;this.teardown();this.options.onStop?.();};activeAnimations.mainThread++;this.options=options;this.initAnimation();this.play();if(options.autoplay===false)
this.pause();}
initAnimation(){const{options}=this;replaceTransitionType(options);const{type=keyframes,repeat=0,repeatDelay=0,repeatType,velocity=0,}=options;let{keyframes:keyframes$1}=options;const generatorFactory=type||keyframes;if(generatorFactory!==keyframes){exports.invariant(keyframes$1.length<=2,`Only two keyframes currently supported with spring and inertia animations. Trying to animate ${keyframes$1}`,"spring-two-frames");}
if(generatorFactory!==keyframes&&typeof keyframes$1[0]!=="number"){this.mixKeyframes=pipe(percentToProgress,mix(keyframes$1[0],keyframes$1[1]));keyframes$1=[0,100];}
const generator=generatorFactory({...options,keyframes:keyframes$1});if(repeatType==="mirror"){this.mirroredGenerator=generatorFactory({...options,keyframes:[...keyframes$1].reverse(),velocity:-velocity,});}
if(generator.calculatedDuration===null){generator.calculatedDuration=calcGeneratorDuration(generator);}
const{calculatedDuration}=generator;this.calculatedDuration=calculatedDuration;this.resolvedDuration=calculatedDuration+repeatDelay;this.totalDuration=this.resolvedDuration*(repeat+1)-repeatDelay;this.generator=generator;}
updateTime(timestamp){const animationTime=Math.round(timestamp-this.startTime)*this.playbackSpeed;if(this.holdTime!==null){this.currentTime=this.holdTime;}
else{this.currentTime=animationTime;}}
tick(timestamp,sample=false){const{generator,totalDuration,mixKeyframes,mirroredGenerator,resolvedDuration,calculatedDuration,}=this;if(this.startTime===null)
return generator.next(0);const{delay=0,keyframes,repeat,repeatType,repeatDelay,type,onUpdate,finalKeyframe,}=this.options;if(this.speed>0){this.startTime=Math.min(this.startTime,timestamp);}
else if(this.speed<0){this.startTime=Math.min(timestamp-totalDuration / this.speed,this.startTime);}
if(sample){this.currentTime=timestamp;}
else{this.updateTime(timestamp);}
const timeWithoutDelay=this.currentTime-delay*(this.playbackSpeed>=0?1:-1);const isInDelayPhase=this.playbackSpeed>=0?timeWithoutDelay<0:timeWithoutDelay>totalDuration;this.currentTime=Math.max(timeWithoutDelay,0);if(this.state==="finished"&&this.holdTime===null){this.currentTime=totalDuration;}
let elapsed=this.currentTime;let frameGenerator=generator;if(repeat){const progress=Math.min(this.currentTime,totalDuration)/ resolvedDuration;let currentIteration=Math.floor(progress);let iterationProgress=progress%1.0;if(!iterationProgress&&progress>=1){iterationProgress=1;}
iterationProgress===1&&currentIteration--;currentIteration=Math.min(currentIteration,repeat+1);const isOddIteration=Boolean(currentIteration%2);if(isOddIteration){if(repeatType==="reverse"){iterationProgress=1-iterationProgress;if(repeatDelay){iterationProgress-=repeatDelay / resolvedDuration;}}
else if(repeatType==="mirror"){frameGenerator=mirroredGenerator;}}
elapsed=clamp(0,1,iterationProgress)*resolvedDuration;}
const state=isInDelayPhase?{done:false,value:keyframes[0]}:frameGenerator.next(elapsed);if(mixKeyframes){state.value=mixKeyframes(state.value);}
let{done}=state;if(!isInDelayPhase&&calculatedDuration!==null){done=this.playbackSpeed>=0?this.currentTime>=totalDuration:this.currentTime<=0;}
const isAnimationFinished=this.holdTime===null&&(this.state==="finished"||(this.state==="running"&&done));if(isAnimationFinished&&type!==inertia){state.value=getFinalKeyframe$1(keyframes,this.options,finalKeyframe,this.speed);}
if(onUpdate){onUpdate(state.value);}
if(isAnimationFinished){this.finish();}
return state;}
then(resolve,reject){return this.finished.then(resolve,reject);}
get duration(){return millisecondsToSeconds(this.calculatedDuration);}
get iterationDuration(){const{delay=0}=this.options||{};return this.duration+millisecondsToSeconds(delay);}
get time(){return millisecondsToSeconds(this.currentTime);}
set time(newTime){newTime=secondsToMilliseconds(newTime);this.currentTime=newTime;if(this.startTime===null||this.holdTime!==null||this.playbackSpeed===0){this.holdTime=newTime;}
else if(this.driver){this.startTime=this.driver.now()-newTime / this.playbackSpeed;}
this.driver?.start(false);}
get speed(){return this.playbackSpeed;}
set speed(newSpeed){this.updateTime(time.now());const hasChanged=this.playbackSpeed!==newSpeed;this.playbackSpeed=newSpeed;if(hasChanged){this.time=millisecondsToSeconds(this.currentTime);}}
play(){if(this.isStopped)
return;const{driver=frameloopDriver,startTime}=this.options;if(!this.driver){this.driver=driver((timestamp)=>this.tick(timestamp));}
this.options.onPlay?.();const now=this.driver.now();if(this.state==="finished"){this.updateFinished();this.startTime=now;}
else if(this.holdTime!==null){this.startTime=now-this.holdTime;}
else if(!this.startTime){this.startTime=startTime??now;}
if(this.state==="finished"&&this.speed<0){this.startTime+=this.calculatedDuration;}
this.holdTime=null;this.state="running";this.driver.start();}
pause(){this.state="paused";this.updateTime(time.now());this.holdTime=this.currentTime;}
complete(){if(this.state!=="running"){this.play();}
this.state="finished";this.holdTime=null;}
finish(){this.notifyFinished();this.teardown();this.state="finished";this.options.onComplete?.();}
cancel(){this.holdTime=null;this.startTime=0;this.tick(0);this.teardown();this.options.onCancel?.();}
teardown(){this.state="idle";this.stopDriver();this.startTime=this.holdTime=null;activeAnimations.mainThread--;}
stopDriver(){if(!this.driver)
return;this.driver.stop();this.driver=undefined;}
sample(sampleTime){this.startTime=0;return this.tick(sampleTime,true);}
attachTimeline(timeline){if(this.options.allowFlatten){this.options.type="keyframes";this.options.ease="linear";this.initAnimation();}
this.driver?.stop();return timeline.observe(this);}}
function animateValue(options){return new JSAnimation(options);}
function fillWildcards(keyframes){for(let i=1;i<keyframes.length;i++){keyframes[i]??(keyframes[i]=keyframes[i-1]);}}
const radToDeg=(rad)=>(rad*180)/ Math.PI;const rotate=(v)=>{const angle=radToDeg(Math.atan2(v[1],v[0]));return rebaseAngle(angle);};const matrix2dParsers={x:4,y:5,translateX:4,translateY:5,scaleX:0,scaleY:3,scale:(v)=>(Math.abs(v[0])+Math.abs(v[3]))/ 2,rotate,rotateZ:rotate,skewX:(v)=>radToDeg(Math.atan(v[1])),skewY:(v)=>radToDeg(Math.atan(v[2])),skew:(v)=>(Math.abs(v[1])+Math.abs(v[2]))/ 2,};const rebaseAngle=(angle)=>{angle=angle%360;if(angle<0)
angle+=360;return angle;};const rotateZ=rotate;const scaleX=(v)=>Math.sqrt(v[0]*v[0]+v[1]*v[1]);const scaleY=(v)=>Math.sqrt(v[4]*v[4]+v[5]*v[5]);const matrix3dParsers={x:12,y:13,z:14,translateX:12,translateY:13,translateZ:14,scaleX,scaleY,scale:(v)=>(scaleX(v)+scaleY(v))/ 2,rotateX:(v)=>rebaseAngle(radToDeg(Math.atan2(v[6],v[5]))),rotateY:(v)=>rebaseAngle(radToDeg(Math.atan2(-v[2],v[0]))),rotateZ,rotate:rotateZ,skewX:(v)=>radToDeg(Math.atan(v[4])),skewY:(v)=>radToDeg(Math.atan(v[1])),skew:(v)=>(Math.abs(v[1])+Math.abs(v[4]))/ 2,};function defaultTransformValue(name){return name.includes("scale")?1:0;}
function parseValueFromTransform(transform,name){if(!transform||transform==="none"){return defaultTransformValue(name);}
const matrix3dMatch=transform.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);let parsers;let match;if(matrix3dMatch){parsers=matrix3dParsers;match=matrix3dMatch;}
else{const matrix2dMatch=transform.match(/^matrix\(([-\d.e\s,]+)\)$/u);parsers=matrix2dParsers;match=matrix2dMatch;}
if(!match){return defaultTransformValue(name);}
const valueParser=parsers[name];const values=match[1].split(",").map(convertTransformToNumber);return typeof valueParser==="function"?valueParser(values):values[valueParser];}
const readTransformValue=(instance,name)=>{const{transform="none"}=getComputedStyle(instance);return parseValueFromTransform(transform,name);};function convertTransformToNumber(value){return parseFloat(value.trim());}
const transformPropOrder=["transformPerspective","x","y","z","translateX","translateY","translateZ","scale","scaleX","scaleY","rotate","rotateX","rotateY","rotateZ","skew","skewX","skewY",];const transformProps=/*@__PURE__*/(()=>new Set(transformPropOrder))();const isNumOrPxType=(v)=>v===number||v===px;const transformKeys=new Set(["x","y","z"]);const nonTranslationalTransformKeys=transformPropOrder.filter((key)=>!transformKeys.has(key));function removeNonTranslationalTransform(visualElement){const removedTransforms=[];nonTranslationalTransformKeys.forEach((key)=>{const value=visualElement.getValue(key);if(value!==undefined){removedTransforms.push([key,value.get()]);value.set(key.startsWith("scale")?1:0);}});return removedTransforms;}
const positionalValues={width:({x},{paddingLeft="0",paddingRight="0"})=>x.max-x.min-parseFloat(paddingLeft)-parseFloat(paddingRight),height:({y},{paddingTop="0",paddingBottom="0"})=>y.max-y.min-parseFloat(paddingTop)-parseFloat(paddingBottom),top:(_bbox,{top})=>parseFloat(top),left:(_bbox,{left})=>parseFloat(left),bottom:({y},{top})=>parseFloat(top)+(y.max-y.min),right:({x},{left})=>parseFloat(left)+(x.max-x.min),x:(_bbox,{transform})=>parseValueFromTransform(transform,"x"),y:(_bbox,{transform})=>parseValueFromTransform(transform,"y"),};positionalValues.translateX=positionalValues.x;positionalValues.translateY=positionalValues.y;const toResolve=new Set();let isScheduled=false;let anyNeedsMeasurement=false;let isForced=false;function measureAllKeyframes(){if(anyNeedsMeasurement){const resolversToMeasure=Array.from(toResolve).filter((resolver)=>resolver.needsMeasurement);const elementsToMeasure=new Set(resolversToMeasure.map((resolver)=>resolver.element));const transformsToRestore=new Map();elementsToMeasure.forEach((element)=>{const removedTransforms=removeNonTranslationalTransform(element);if(!removedTransforms.length)
return;transformsToRestore.set(element,removedTransforms);element.render();});resolversToMeasure.forEach((resolver)=>resolver.measureInitialState());elementsToMeasure.forEach((element)=>{element.render();const restore=transformsToRestore.get(element);if(restore){restore.forEach(([key,value])=>{element.getValue(key)?.set(value);});}});resolversToMeasure.forEach((resolver)=>resolver.measureEndState());resolversToMeasure.forEach((resolver)=>{if(resolver.suspendedScrollY!==undefined){window.scrollTo(0,resolver.suspendedScrollY);}});}
anyNeedsMeasurement=false;isScheduled=false;toResolve.forEach((resolver)=>resolver.complete(isForced));toResolve.clear();}
function readAllKeyframes(){toResolve.forEach((resolver)=>{resolver.readKeyframes();if(resolver.needsMeasurement){anyNeedsMeasurement=true;}});}
function flushKeyframeResolvers(){isForced=true;readAllKeyframes();measureAllKeyframes();isForced=false;}
class KeyframeResolver{constructor(unresolvedKeyframes,onComplete,name,motionValue,element,isAsync=false){this.state="pending";this.isAsync=false;this.needsMeasurement=false;this.unresolvedKeyframes=[...unresolvedKeyframes];this.onComplete=onComplete;this.name=name;this.motionValue=motionValue;this.element=element;this.isAsync=isAsync;}
scheduleResolve(){this.state="scheduled";if(this.isAsync){toResolve.add(this);if(!isScheduled){isScheduled=true;frame.read(readAllKeyframes);frame.resolveKeyframes(measureAllKeyframes);}}
else{this.readKeyframes();this.complete();}}
readKeyframes(){const{unresolvedKeyframes,name,element,motionValue}=this;if(unresolvedKeyframes[0]===null){const currentValue=motionValue?.get();const finalKeyframe=unresolvedKeyframes[unresolvedKeyframes.length-1];if(currentValue!==undefined){unresolvedKeyframes[0]=currentValue;}
else if(element&&name){const valueAsRead=element.readValue(name,finalKeyframe);if(valueAsRead!==undefined&&valueAsRead!==null){unresolvedKeyframes[0]=valueAsRead;}}
if(unresolvedKeyframes[0]===undefined){unresolvedKeyframes[0]=finalKeyframe;}
if(motionValue&&currentValue===undefined){motionValue.set(unresolvedKeyframes[0]);}}
fillWildcards(unresolvedKeyframes);}
setFinalKeyframe(){}
measureInitialState(){}
renderEndStyles(){}
measureEndState(){}
complete(isForcedComplete=false){this.state="complete";this.onComplete(this.unresolvedKeyframes,this.finalKeyframe,isForcedComplete);toResolve.delete(this);}
cancel(){if(this.state==="scheduled"){toResolve.delete(this);this.state="pending";}}
resume(){if(this.state==="pending")
this.scheduleResolve();}}
const isCSSVar=(name)=>name.startsWith("--");function setStyle(element,name,value){isCSSVar(name)?element.style.setProperty(name,value):(element.style[name]=value);}
const supportsScrollTimeline=memo(()=>window.ScrollTimeline!==undefined);const supportsFlags={};function memoSupports(callback,supportsFlag){const memoized=memo(callback);return()=>supportsFlags[supportsFlag]??memoized();}
const supportsLinearEasing=/*@__PURE__*/ memoSupports(()=>{try{document.createElement("div").animate({opacity:0},{easing:"linear(0, 1)"});}
catch(e){return false;}
return true;},"linearEasing");const cubicBezierAsString=([a,b,c,d])=>`cubic-bezier(${a}, ${b}, ${c}, ${d})`;const supportedWaapiEasing={linear:"linear",ease:"ease",easeIn:"ease-in",easeOut:"ease-out",easeInOut:"ease-in-out",circIn:/*@__PURE__*/ cubicBezierAsString([0,0.65,0.55,1]),circOut:/*@__PURE__*/ cubicBezierAsString([0.55,0,1,0.45]),backIn:/*@__PURE__*/ cubicBezierAsString([0.31,0.01,0.66,-0.59]),backOut:/*@__PURE__*/ cubicBezierAsString([0.33,1.53,0.69,0.99]),};function mapEasingToNativeEasing(easing,duration){if(!easing){return undefined;}
else if(typeof easing==="function"){return supportsLinearEasing()?generateLinearEasing(easing,duration):"ease-out";}
else if(isBezierDefinition(easing)){return cubicBezierAsString(easing);}
else if(Array.isArray(easing)){return easing.map((segmentEasing)=>mapEasingToNativeEasing(segmentEasing,duration)||supportedWaapiEasing.easeOut);}
else{return supportedWaapiEasing[easing];}}
function startWaapiAnimation(element,valueName,keyframes,{delay=0,duration=300,repeat=0,repeatType="loop",ease="easeOut",times,}={},pseudoElement=undefined){const keyframeOptions={[valueName]:keyframes,};if(times)
keyframeOptions.offset=times;const easing=mapEasingToNativeEasing(ease,duration);if(Array.isArray(easing))
keyframeOptions.easing=easing;if(statsBuffer.value){activeAnimations.waapi++;}
const options={delay,duration,easing:!Array.isArray(easing)?easing:"linear",fill:"both",iterations:repeat+1,direction:repeatType==="reverse"?"alternate":"normal",};if(pseudoElement)
options.pseudoElement=pseudoElement;const animation=element.animate(keyframeOptions,options);if(statsBuffer.value){animation.finished.finally(()=>{activeAnimations.waapi--;});}
return animation;}
function isGenerator(type){return typeof type==="function"&&"applyToOptions"in type;}
function applyGeneratorOptions({type,...options}){if(isGenerator(type)&&supportsLinearEasing()){return type.applyToOptions(options);}
else{options.duration??(options.duration=300);options.ease??(options.ease="easeOut");}
return options;}
class NativeAnimation extends WithPromise{constructor(options){super();this.finishedTime=null;this.isStopped=false;if(!options)
return;const{element,name,keyframes,pseudoElement,allowFlatten=false,finalKeyframe,onComplete,}=options;this.isPseudoElement=Boolean(pseudoElement);this.allowFlatten=allowFlatten;this.options=options;exports.invariant(typeof options.type!=="string",`Mini animate() doesn't support "type" as a string.`,"mini-spring");const transition=applyGeneratorOptions(options);this.animation=startWaapiAnimation(element,name,keyframes,transition,pseudoElement);if(transition.autoplay===false){this.animation.pause();}
this.animation.onfinish=()=>{this.finishedTime=this.time;if(!pseudoElement){const keyframe=getFinalKeyframe$1(keyframes,this.options,finalKeyframe,this.speed);if(this.updateMotionValue){this.updateMotionValue(keyframe);}
else{setStyle(element,name,keyframe);}
this.animation.cancel();}
onComplete?.();this.notifyFinished();};}
play(){if(this.isStopped)
return;this.animation.play();if(this.state==="finished"){this.updateFinished();}}
pause(){this.animation.pause();}
complete(){this.animation.finish?.();}
cancel(){try{this.animation.cancel();}
catch(e){}}
stop(){if(this.isStopped)
return;this.isStopped=true;const{state}=this;if(state==="idle"||state==="finished"){return;}
if(this.updateMotionValue){this.updateMotionValue();}
else{this.commitStyles();}
if(!this.isPseudoElement)
this.cancel();}
commitStyles(){if(!this.isPseudoElement){this.animation.commitStyles?.();}}
get duration(){const duration=this.animation.effect?.getComputedTiming?.().duration||0;return millisecondsToSeconds(Number(duration));}
get iterationDuration(){const{delay=0}=this.options||{};return this.duration+millisecondsToSeconds(delay);}
get time(){return millisecondsToSeconds(Number(this.animation.currentTime)||0);}
set time(newTime){this.finishedTime=null;this.animation.currentTime=secondsToMilliseconds(newTime);}
get speed(){return this.animation.playbackRate;}
set speed(newSpeed){if(newSpeed<0)
this.finishedTime=null;this.animation.playbackRate=newSpeed;}
get state(){return this.finishedTime!==null?"finished":this.animation.playState;}
get startTime(){return Number(this.animation.startTime);}
set startTime(newStartTime){this.animation.startTime=newStartTime;}
attachTimeline({timeline,observe}){if(this.allowFlatten){this.animation.effect?.updateTiming({easing:"linear"});}
this.animation.onfinish=null;if(timeline&&supportsScrollTimeline()){this.animation.timeline=timeline;return noop;}
else{return observe(this);}}}
const unsupportedEasingFunctions={anticipate,backInOut,circInOut,};function isUnsupportedEase(key){return key in unsupportedEasingFunctions;}
function replaceStringEasing(transition){if(typeof transition.ease==="string"&&isUnsupportedEase(transition.ease)){transition.ease=unsupportedEasingFunctions[transition.ease];}}
const sampleDelta=10;class NativeAnimationExtended extends NativeAnimation{constructor(options){replaceStringEasing(options);replaceTransitionType(options);super(options);if(options.startTime){this.startTime=options.startTime;}
this.options=options;}
updateMotionValue(value){const{motionValue,onUpdate,onComplete,element,...options}=this.options;if(!motionValue)
return;if(value!==undefined){motionValue.set(value);return;}
const sampleAnimation=new JSAnimation({...options,autoplay:false,});const sampleTime=secondsToMilliseconds(this.finishedTime??this.time);motionValue.setWithVelocity(sampleAnimation.sample(sampleTime-sampleDelta).value,sampleAnimation.sample(sampleTime).value,sampleDelta);sampleAnimation.stop();}}
const isAnimatable=(value,name)=>{if(name==="zIndex")
return false;if(typeof value==="number"||Array.isArray(value))
return true;if(typeof value==="string"&&(complex.test(value)||value==="0")&&!value.startsWith("url(")){return true;}
return false;};function hasKeyframesChanged(keyframes){const current=keyframes[0];if(keyframes.length===1)
return true;for(let i=0;i<keyframes.length;i++){if(keyframes[i]!==current)
return true;}}
function canAnimate(keyframes,name,type,velocity){const originKeyframe=keyframes[0];if(originKeyframe===null)
return false;if(name==="display"||name==="visibility")
return true;const targetKeyframe=keyframes[keyframes.length-1];const isOriginAnimatable=isAnimatable(originKeyframe,name);const isTargetAnimatable=isAnimatable(targetKeyframe,name);exports.warning(isOriginAnimatable===isTargetAnimatable,`You are trying to animate ${name} from "${originKeyframe}" to "${targetKeyframe}". "${isOriginAnimatable ? targetKeyframe : originKeyframe}" is not an animatable value.`,"value-not-animatable");if(!isOriginAnimatable||!isTargetAnimatable){return false;}
return(hasKeyframesChanged(keyframes)||((type==="spring"||isGenerator(type))&&velocity));}
function makeAnimationInstant(options){options.duration=0;options.type="keyframes";}
const acceleratedValues$1=new Set(["opacity","clipPath","filter","transform",]);const supportsWaapi=/*@__PURE__*/ memo(()=>Object.hasOwnProperty.call(Element.prototype,"animate"));function supportsBrowserAnimation(options){const{motionValue,name,repeatDelay,repeatType,damping,type}=options;const subject=motionValue?.owner?.current;if(!(subject instanceof HTMLElement)){return false;}
const{onUpdate,transformTemplate}=motionValue.owner.getProps();return(supportsWaapi()&&name&&acceleratedValues$1.has(name)&&(name!=="transform"||!transformTemplate)&&!onUpdate&&!repeatDelay&&repeatType!=="mirror"&&damping!==0&&type!=="inertia");}
const MAX_RESOLVE_DELAY=40;class AsyncMotionValueAnimation extends WithPromise{constructor({autoplay=true,delay=0,type="keyframes",repeat=0,repeatDelay=0,repeatType="loop",keyframes,name,motionValue,element,...options}){super();this.stop=()=>{if(this._animation){this._animation.stop();this.stopTimeline?.();}
this.keyframeResolver?.cancel();};this.createdAt=time.now();const optionsWithDefaults={autoplay,delay,type,repeat,repeatDelay,repeatType,name,motionValue,element,...options,};const KeyframeResolver$1=element?.KeyframeResolver||KeyframeResolver;this.keyframeResolver=new KeyframeResolver$1(keyframes,(resolvedKeyframes,finalKeyframe,forced)=>this.onKeyframesResolved(resolvedKeyframes,finalKeyframe,optionsWithDefaults,!forced),name,motionValue,element);this.keyframeResolver?.scheduleResolve();}
onKeyframesResolved(keyframes,finalKeyframe,options,sync){this.keyframeResolver=undefined;const{name,type,velocity,delay,isHandoff,onUpdate}=options;this.resolvedAt=time.now();if(!canAnimate(keyframes,name,type,velocity)){if(MotionGlobalConfig.instantAnimations||!delay){onUpdate?.(getFinalKeyframe$1(keyframes,options,finalKeyframe));}
keyframes[0]=keyframes[keyframes.length-1];makeAnimationInstant(options);options.repeat=0;}
const startTime=sync?!this.resolvedAt?this.createdAt:this.resolvedAt-this.createdAt>MAX_RESOLVE_DELAY?this.resolvedAt:this.createdAt:undefined;const resolvedOptions={startTime,finalKeyframe,...options,keyframes,};const animation=!isHandoff&&supportsBrowserAnimation(resolvedOptions)?new NativeAnimationExtended({...resolvedOptions,element:resolvedOptions.motionValue.owner.current,}):new JSAnimation(resolvedOptions);animation.finished.then(()=>this.notifyFinished()).catch(noop);if(this.pendingTimeline){this.stopTimeline=animation.attachTimeline(this.pendingTimeline);this.pendingTimeline=undefined;}
this._animation=animation;}
get finished(){if(!this._animation){return this._finished;}
else{return this.animation.finished;}}
then(onResolve,_onReject){return this.finished.finally(onResolve).then(()=>{});}
get animation(){if(!this._animation){this.keyframeResolver?.resume();flushKeyframeResolvers();}
return this._animation;}
get duration(){return this.animation.duration;}
get iterationDuration(){return this.animation.iterationDuration;}
get time(){return this.animation.time;}
set time(newTime){this.animation.time=newTime;}
get speed(){return this.animation.speed;}
get state(){return this.animation.state;}
set speed(newSpeed){this.animation.speed=newSpeed;}
get startTime(){return this.animation.startTime;}
attachTimeline(timeline){if(this._animation){this.stopTimeline=this.animation.attachTimeline(timeline);}
else{this.pendingTimeline=timeline;}
return()=>this.stop();}
play(){this.animation.play();}
pause(){this.animation.pause();}
complete(){this.animation.complete();}
cancel(){if(this._animation){this.animation.cancel();}
this.keyframeResolver?.cancel();}}
class GroupAnimation{constructor(animations){this.stop=()=>this.runAll("stop");this.animations=animations.filter(Boolean);}
get finished(){return Promise.all(this.animations.map((animation)=>animation.finished));}
getAll(propName){return this.animations[0][propName];}
setAll(propName,newValue){for(let i=0;i<this.animations.length;i++){this.animations[i][propName]=newValue;}}
attachTimeline(timeline){const subscriptions=this.animations.map((animation)=>animation.attachTimeline(timeline));return()=>{subscriptions.forEach((cancel,i)=>{cancel&&cancel();this.animations[i].stop();});};}
get time(){return this.getAll("time");}
set time(time){this.setAll("time",time);}
get speed(){return this.getAll("speed");}
set speed(speed){this.setAll("speed",speed);}
get state(){return this.getAll("state");}
get startTime(){return this.getAll("startTime");}
get duration(){return getMax(this.animations,"duration");}
get iterationDuration(){return getMax(this.animations,"iterationDuration");}
runAll(methodName){this.animations.forEach((controls)=>controls[methodName]());}
play(){this.runAll("play");}
pause(){this.runAll("pause");}
cancel(){this.runAll("cancel");}
complete(){this.runAll("complete");}}
function getMax(animations,propName){let max=0;for(let i=0;i<animations.length;i++){const value=animations[i][propName];if(value!==null&&value>max){max=value;}}
return max;}
class GroupAnimationWithThen extends GroupAnimation{then(onResolve,_onReject){return this.finished.finally(onResolve).then(()=>{});}}
class NativeAnimationWrapper extends NativeAnimation{constructor(animation){super();this.animation=animation;animation.onfinish=()=>{this.finishedTime=this.time;this.notifyFinished();};}}
const animationMaps=new WeakMap();const animationMapKey=(name,pseudoElement="")=>`${name}:${pseudoElement}`;function getAnimationMap(element){const map=animationMaps.get(element)||new Map();animationMaps.set(element,map);return map;}
const splitCSSVariableRegex=/^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;function parseCSSVariable(current){const match=splitCSSVariableRegex.exec(current);if(!match)
return[,];const[,token1,token2,fallback]=match;return[`--${token1 ?? token2}`,fallback];}
const maxDepth=4;function getVariableValue(current,element,depth=1){exports.invariant(depth<=maxDepth,`Max CSS variable fallback depth detected in property "${current}". This may indicate a circular fallback dependency.`,"max-css-var-depth");const[token,fallback]=parseCSSVariable(current);if(!token)
return;const resolved=window.getComputedStyle(element).getPropertyValue(token);if(resolved){const trimmed=resolved.trim();return isNumericalString(trimmed)?parseFloat(trimmed):trimmed;}
return isCSSVariableToken(fallback)?getVariableValue(fallback,element,depth+1):fallback;}
function getValueTransition$1(transition,key){return(transition?.[key]??transition?.["default"]??transition);}
const positionalKeys=new Set(["width","height","top","left","right","bottom",...transformPropOrder,]);const auto={test:(v)=>v==="auto",parse:(v)=>v,};const testValueType=(v)=>(type)=>type.test(v);const dimensionValueTypes=[number,px,percent,degrees,vw,vh,auto];const findDimensionValueType=(v)=>dimensionValueTypes.find(testValueType(v));function isNone(value){if(typeof value==="number"){return value===0;}
else if(value!==null){return value==="none"||value==="0"||isZeroValueString(value);}
else{return true;}}
const maxDefaults=new Set(["brightness","contrast","saturate","opacity"]);function applyDefaultFilter(v){const[name,value]=v.slice(0,-1).split("(");if(name==="drop-shadow")
return v;const[number]=value.match(floatRegex)||[];if(!number)
return v;const unit=value.replace(number,"");let defaultValue=maxDefaults.has(name)?1:0;if(number!==value)
defaultValue*=100;return name+"("+defaultValue+unit+")";}
const functionRegex=/\b([a-z-]*)\(.*?\)/gu;const filter={...complex,getAnimatableNone:(v)=>{const functions=v.match(functionRegex);return functions?functions.map(applyDefaultFilter).join(" "):v;},};const int={...number,transform:Math.round,};const transformValueTypes={rotate:degrees,rotateX:degrees,rotateY:degrees,rotateZ:degrees,scale,scaleX:scale,scaleY:scale,scaleZ:scale,skew:degrees,skewX:degrees,skewY:degrees,distance:px,translateX:px,translateY:px,translateZ:px,x:px,y:px,z:px,perspective:px,transformPerspective:px,opacity:alpha,originX:progressPercentage,originY:progressPercentage,originZ:px,};const numberValueTypes={borderWidth:px,borderTopWidth:px,borderRightWidth:px,borderBottomWidth:px,borderLeftWidth:px,borderRadius:px,radius:px,borderTopLeftRadius:px,borderTopRightRadius:px,borderBottomRightRadius:px,borderBottomLeftRadius:px,width:px,maxWidth:px,height:px,maxHeight:px,top:px,right:px,bottom:px,left:px,padding:px,paddingTop:px,paddingRight:px,paddingBottom:px,paddingLeft:px,margin:px,marginTop:px,marginRight:px,marginBottom:px,marginLeft:px,backgroundPositionX:px,backgroundPositionY:px,...transformValueTypes,zIndex:int,fillOpacity:alpha,strokeOpacity:alpha,numOctaves:int,};const defaultValueTypes={...numberValueTypes,color,backgroundColor:color,outlineColor:color,fill:color,stroke:color,borderColor:color,borderTopColor:color,borderRightColor:color,borderBottomColor:color,borderLeftColor:color,filter,WebkitFilter:filter,};const getDefaultValueType=(key)=>defaultValueTypes[key];function getAnimatableNone(key,value){let defaultValueType=getDefaultValueType(key);if(defaultValueType!==filter)
defaultValueType=complex;return defaultValueType.getAnimatableNone?defaultValueType.getAnimatableNone(value):undefined;}
const invalidTemplates=new Set(["auto","none","0"]);function makeNoneKeyframesAnimatable(unresolvedKeyframes,noneKeyframeIndexes,name){let i=0;let animatableTemplate=undefined;while(i<unresolvedKeyframes.length&&!animatableTemplate){const keyframe=unresolvedKeyframes[i];if(typeof keyframe==="string"&&!invalidTemplates.has(keyframe)&&analyseComplexValue(keyframe).values.length){animatableTemplate=unresolvedKeyframes[i];}
i++;}
if(animatableTemplate&&name){for(const noneIndex of noneKeyframeIndexes){unresolvedKeyframes[noneIndex]=getAnimatableNone(name,animatableTemplate);}}}
class DOMKeyframesResolver extends KeyframeResolver{constructor(unresolvedKeyframes,onComplete,name,motionValue,element){super(unresolvedKeyframes,onComplete,name,motionValue,element,true);}
readKeyframes(){const{unresolvedKeyframes,element,name}=this;if(!element||!element.current)
return;super.readKeyframes();for(let i=0;i<unresolvedKeyframes.length;i++){let keyframe=unresolvedKeyframes[i];if(typeof keyframe==="string"){keyframe=keyframe.trim();if(isCSSVariableToken(keyframe)){const resolved=getVariableValue(keyframe,element.current);if(resolved!==undefined){unresolvedKeyframes[i]=resolved;}
if(i===unresolvedKeyframes.length-1){this.finalKeyframe=keyframe;}}}}
this.resolveNoneKeyframes();if(!positionalKeys.has(name)||unresolvedKeyframes.length!==2){return;}
const[origin,target]=unresolvedKeyframes;const originType=findDimensionValueType(origin);const targetType=findDimensionValueType(target);if(originType===targetType)
return;if(isNumOrPxType(originType)&&isNumOrPxType(targetType)){for(let i=0;i<unresolvedKeyframes.length;i++){const value=unresolvedKeyframes[i];if(typeof value==="string"){unresolvedKeyframes[i]=parseFloat(value);}}}
else if(positionalValues[name]){this.needsMeasurement=true;}}
resolveNoneKeyframes(){const{unresolvedKeyframes,name}=this;const noneKeyframeIndexes=[];for(let i=0;i<unresolvedKeyframes.length;i++){if(unresolvedKeyframes[i]===null||isNone(unresolvedKeyframes[i])){noneKeyframeIndexes.push(i);}}
if(noneKeyframeIndexes.length){makeNoneKeyframesAnimatable(unresolvedKeyframes,noneKeyframeIndexes,name);}}
measureInitialState(){const{element,unresolvedKeyframes,name}=this;if(!element||!element.current)
return;if(name==="height"){this.suspendedScrollY=window.pageYOffset;}
this.measuredOrigin=positionalValues[name](element.measureViewportBox(),window.getComputedStyle(element.current));unresolvedKeyframes[0]=this.measuredOrigin;const measureKeyframe=unresolvedKeyframes[unresolvedKeyframes.length-1];if(measureKeyframe!==undefined){element.getValue(name,measureKeyframe).jump(measureKeyframe,false);}}
measureEndState(){const{element,name,unresolvedKeyframes}=this;if(!element||!element.current)
return;const value=element.getValue(name);value&&value.jump(this.measuredOrigin,false);const finalKeyframeIndex=unresolvedKeyframes.length-1;const finalKeyframe=unresolvedKeyframes[finalKeyframeIndex];unresolvedKeyframes[finalKeyframeIndex]=positionalValues[name](element.measureViewportBox(),window.getComputedStyle(element.current));if(finalKeyframe!==null&&this.finalKeyframe===undefined){this.finalKeyframe=finalKeyframe;}
if(this.removedTransforms?.length){this.removedTransforms.forEach(([unsetTransformName,unsetTransformValue])=>{element.getValue(unsetTransformName).set(unsetTransformValue);});}
this.resolveNoneKeyframes();}}
const pxValues=new Set(["borderWidth","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth","borderRadius","radius","borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius","width","maxWidth","height","maxHeight","top","right","bottom","left","padding","paddingTop","paddingRight","paddingBottom","paddingLeft","margin","marginTop","marginRight","marginBottom","marginLeft","backgroundPositionX","backgroundPositionY",]);function applyPxDefaults(keyframes,name){for(let i=0;i<keyframes.length;i++){if(typeof keyframes[i]==="number"&&pxValues.has(name)){keyframes[i]=keyframes[i]+"px";}}}
function isWaapiSupportedEasing(easing){return Boolean((typeof easing==="function"&&supportsLinearEasing())||!easing||(typeof easing==="string"&&(easing in supportedWaapiEasing||supportsLinearEasing()))||isBezierDefinition(easing)||(Array.isArray(easing)&&easing.every(isWaapiSupportedEasing)));}
const supportsPartialKeyframes=/*@__PURE__*/ memo(()=>{try{document.createElement("div").animate({opacity:[1]});}
catch(e){return false;}
return true;});const acceleratedValues=new Set(["opacity","clipPath","filter","transform",]);function camelToDash$1(str){return str.replace(/([A-Z])/g,(match)=>`-${match.toLowerCase()}`);}
function resolveElements(elementOrSelector,scope,selectorCache){if(elementOrSelector instanceof EventTarget){return[elementOrSelector];}
else if(typeof elementOrSelector==="string"){let root=document;if(scope){root=scope.current;}
const elements=selectorCache?.[elementOrSelector]??root.querySelectorAll(elementOrSelector);return elements?Array.from(elements):[];}
return Array.from(elementOrSelector);}
function createSelectorEffect(subjectEffect){return(subject,values)=>{const elements=resolveElements(subject);const subscriptions=[];for(const element of elements){const remove=subjectEffect(element,values);subscriptions.push(remove);}
return()=>{for(const remove of subscriptions)
remove();};};}
const getValueAsType=(value,type)=>{return type&&typeof value==="number"?type.transform(value):value;};class MotionValueState{constructor(){this.latest={};this.values=new Map();}
set(name,value,render,computed,useDefaultValueType=true){const existingValue=this.values.get(name);if(existingValue){existingValue.onRemove();}
const onChange=()=>{const v=value.get();if(useDefaultValueType){this.latest[name]=getValueAsType(v,numberValueTypes[name]);}
else{this.latest[name]=v;}
render&&frame.render(render);};onChange();const cancelOnChange=value.on("change",onChange);computed&&value.addDependent(computed);const remove=()=>{cancelOnChange();render&&cancelFrame(render);this.values.delete(name);computed&&value.removeDependent(computed);};this.values.set(name,{value,onRemove:remove});return remove;}
get(name){return this.values.get(name)?.value;}
destroy(){for(const value of this.values.values()){value.onRemove();}}}
function createEffect(addValue){const stateCache=new WeakMap();const subscriptions=[];return(subject,values)=>{const state=stateCache.get(subject)??new MotionValueState();stateCache.set(subject,state);for(const key in values){const value=values[key];const remove=addValue(subject,state,key,value);subscriptions.push(remove);}
return()=>{for(const cancel of subscriptions)
cancel();};};}
function canSetAsProperty(element,name){if(!(name in element))
return false;const descriptor=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element),name)||Object.getOwnPropertyDescriptor(element,name);return descriptor&&typeof descriptor.set==="function";}
const addAttrValue=(element,state,key,value)=>{const isProp=canSetAsProperty(element,key);const name=isProp?key:key.startsWith("data")||key.startsWith("aria")?camelToDash$1(key):key;const render=isProp?()=>{element[name]=state.latest[key];}:()=>{const v=state.latest[key];if(v===null||v===undefined){element.removeAttribute(name);}
else{element.setAttribute(name,String(v));}};return state.set(key,value,render);};const attrEffect=/*@__PURE__*/ createSelectorEffect(/*@__PURE__*/ createEffect(addAttrValue));const propEffect=/*@__PURE__*/ createEffect((subject,state,key,value)=>{return state.set(key,value,()=>{subject[key]=state.latest[key];},undefined,false);});function isHTMLElement(element){return isObject(element)&&"offsetHeight"in element;}
const MAX_VELOCITY_DELTA=30;const isFloat=(value)=>{return!isNaN(parseFloat(value));};const collectMotionValues={current:undefined,};class MotionValue{constructor(init,options={}){this.canTrackVelocity=null;this.events={};this.updateAndNotify=(v)=>{const currentTime=time.now();if(this.updatedAt!==currentTime){this.setPrevFrameValue();}
this.prev=this.current;this.setCurrent(v);if(this.current!==this.prev){this.events.change?.notify(this.current);if(this.dependents){for(const dependent of this.dependents){dependent.dirty();}}}};this.hasAnimated=false;this.setCurrent(init);this.owner=options.owner;}
setCurrent(current){this.current=current;this.updatedAt=time.now();if(this.canTrackVelocity===null&&current!==undefined){this.canTrackVelocity=isFloat(this.current);}}
setPrevFrameValue(prevFrameValue=this.current){this.prevFrameValue=prevFrameValue;this.prevUpdatedAt=this.updatedAt;}
onChange(subscription){{warnOnce(false,`value.onChange(callback) is deprecated. Switch to value.on("change", callback).`);}
return this.on("change",subscription);}
on(eventName,callback){if(!this.events[eventName]){this.events[eventName]=new SubscriptionManager();}
const unsubscribe=this.events[eventName].add(callback);if(eventName==="change"){return()=>{unsubscribe();frame.read(()=>{if(!this.events.change.getSize()){this.stop();}});};}
return unsubscribe;}
clearListeners(){for(const eventManagers in this.events){this.events[eventManagers].clear();}}
attach(passiveEffect,stopPassiveEffect){this.passiveEffect=passiveEffect;this.stopPassiveEffect=stopPassiveEffect;}
set(v){if(!this.passiveEffect){this.updateAndNotify(v);}
else{this.passiveEffect(v,this.updateAndNotify);}}
setWithVelocity(prev,current,delta){this.set(current);this.prev=undefined;this.prevFrameValue=prev;this.prevUpdatedAt=this.updatedAt-delta;}
jump(v,endAnimation=true){this.updateAndNotify(v);this.prev=v;this.prevUpdatedAt=this.prevFrameValue=undefined;endAnimation&&this.stop();if(this.stopPassiveEffect)
this.stopPassiveEffect();}
dirty(){this.events.change?.notify(this.current);}
addDependent(dependent){if(!this.dependents){this.dependents=new Set();}
this.dependents.add(dependent);}
removeDependent(dependent){if(this.dependents){this.dependents.delete(dependent);}}
get(){if(collectMotionValues.current){collectMotionValues.current.push(this);}
return this.current;}
getPrevious(){return this.prev;}
getVelocity(){const currentTime=time.now();if(!this.canTrackVelocity||this.prevFrameValue===undefined||currentTime-this.updatedAt>MAX_VELOCITY_DELTA){return 0;}
const delta=Math.min(this.updatedAt-this.prevUpdatedAt,MAX_VELOCITY_DELTA);return velocityPerSecond(parseFloat(this.current)-
parseFloat(this.prevFrameValue),delta);}
start(startAnimation){this.stop();return new Promise((resolve)=>{this.hasAnimated=true;this.animation=startAnimation(resolve);if(this.events.animationStart){this.events.animationStart.notify();}}).then(()=>{if(this.events.animationComplete){this.events.animationComplete.notify();}
this.clearAnimation();});}
stop(){if(this.animation){this.animation.stop();if(this.events.animationCancel){this.events.animationCancel.notify();}}
this.clearAnimation();}
isAnimating(){return!!this.animation;}
clearAnimation(){delete this.animation;}
destroy(){this.dependents?.clear();this.events.destroy?.notify();this.clearListeners();this.stop();if(this.stopPassiveEffect){this.stopPassiveEffect();}}}
function motionValue(init,options){return new MotionValue(init,options);}
const translateAlias$1={x:"translateX",y:"translateY",z:"translateZ",transformPerspective:"perspective",};function buildTransform$1(state){let transform="";let transformIsDefault=true;for(let i=0;i<transformPropOrder.length;i++){const key=transformPropOrder[i];const value=state.latest[key];if(value===undefined)
continue;let valueIsDefault=true;if(typeof value==="number"){valueIsDefault=value===(key.startsWith("scale")?1:0);}
else{valueIsDefault=parseFloat(value)===0;}
if(!valueIsDefault){transformIsDefault=false;const transformName=translateAlias$1[key]||key;const valueToRender=state.latest[key];transform+=`${transformName}(${valueToRender}) `;}}
return transformIsDefault?"none":transform.trim();}
const originProps=new Set(["originX","originY","originZ"]);const addStyleValue=(element,state,key,value)=>{let render=undefined;let computed=undefined;if(transformProps.has(key)){if(!state.get("transform")){if(!isHTMLElement(element)&&!state.get("transformBox")){addStyleValue(element,state,"transformBox",new MotionValue("fill-box"));}
state.set("transform",new MotionValue("none"),()=>{element.style.transform=buildTransform$1(state);});}
computed=state.get("transform");}
else if(originProps.has(key)){if(!state.get("transformOrigin")){state.set("transformOrigin",new MotionValue(""),()=>{const originX=state.latest.originX??"50%";const originY=state.latest.originY??"50%";const originZ=state.latest.originZ??0;element.style.transformOrigin=`${originX} ${originY} ${originZ}`;});}
computed=state.get("transformOrigin");}
else if(isCSSVar(key)){render=()=>{element.style.setProperty(key,state.latest[key]);};}
else{render=()=>{element.style[key]=state.latest[key];};}
return state.set(key,value,render,computed);};const styleEffect=/*@__PURE__*/ createSelectorEffect(/*@__PURE__*/ createEffect(addStyleValue));const toPx=px.transform;function addSVGPathValue(element,state,key,value){frame.render(()=>element.setAttribute("pathLength","1"));if(key==="pathOffset"){return state.set(key,value,()=>element.setAttribute("stroke-dashoffset",toPx(-state.latest[key])));}
else{if(!state.get("stroke-dasharray")){state.set("stroke-dasharray",new MotionValue("1 1"),()=>{const{pathLength=1,pathSpacing}=state.latest;element.setAttribute("stroke-dasharray",`${toPx(pathLength)} ${toPx(pathSpacing ?? 1 - Number(pathLength))}`);});}
return state.set(key,value,undefined,state.get("stroke-dasharray"));}}
const addSVGValue=(element,state,key,value)=>{if(key.startsWith("path")){return addSVGPathValue(element,state,key,value);}
else if(key.startsWith("attr")){return addAttrValue(element,state,convertAttrKey(key),value);}
const handler=key in element.style?addStyleValue:addAttrValue;return handler(element,state,key,value);};const svgEffect=/*@__PURE__*/ createSelectorEffect(/*@__PURE__*/ createEffect(addSVGValue));function convertAttrKey(key){return key.replace(/^attr([A-Z])/,(_,firstChar)=>firstChar.toLowerCase());}
const{schedule:microtask,cancel:cancelMicrotask}=createRenderBatcher(queueMicrotask,false);const isDragging={x:false,y:false,};function isDragActive(){return isDragging.x||isDragging.y;}
function setDragLock(axis){if(axis==="x"||axis==="y"){if(isDragging[axis]){return null;}
else{isDragging[axis]=true;return()=>{isDragging[axis]=false;};}}
else{if(isDragging.x||isDragging.y){return null;}
else{isDragging.x=isDragging.y=true;return()=>{isDragging.x=isDragging.y=false;};}}}
function setupGesture(elementOrSelector,options){const elements=resolveElements(elementOrSelector);const gestureAbortController=new AbortController();const eventOptions={passive:true,...options,signal:gestureAbortController.signal,};const cancel=()=>gestureAbortController.abort();return[elements,eventOptions,cancel];}
function isValidHover(event){return!(event.pointerType==="touch"||isDragActive());}
function hover(elementOrSelector,onHoverStart,options={}){const[elements,eventOptions,cancel]=setupGesture(elementOrSelector,options);const onPointerEnter=(enterEvent)=>{if(!isValidHover(enterEvent))
return;const{target}=enterEvent;const onHoverEnd=onHoverStart(target,enterEvent);if(typeof onHoverEnd!=="function"||!target)
return;const onPointerLeave=(leaveEvent)=>{if(!isValidHover(leaveEvent))
return;onHoverEnd(leaveEvent);target.removeEventListener("pointerleave",onPointerLeave);};target.addEventListener("pointerleave",onPointerLeave,eventOptions);};elements.forEach((element)=>{element.addEventListener("pointerenter",onPointerEnter,eventOptions);});return cancel;}
const isNodeOrChild=(parent,child)=>{if(!child){return false;}
else if(parent===child){return true;}
else{return isNodeOrChild(parent,child.parentElement);}};const isPrimaryPointer=(event)=>{if(event.pointerType==="mouse"){return typeof event.button!=="number"||event.button<=0;}
else{return event.isPrimary!==false;}};const focusableElements=new Set(["BUTTON","INPUT","SELECT","TEXTAREA","A",]);function isElementKeyboardAccessible(element){return(focusableElements.has(element.tagName)||element.tabIndex!==-1);}
const isPressing=new WeakSet();function filterEvents(callback){return(event)=>{if(event.key!=="Enter")
return;callback(event);};}
function firePointerEvent(target,type){target.dispatchEvent(new PointerEvent("pointer"+type,{isPrimary:true,bubbles:true}));}
const enableKeyboardPress=(focusEvent,eventOptions)=>{const element=focusEvent.currentTarget;if(!element)
return;const handleKeydown=filterEvents(()=>{if(isPressing.has(element))
return;firePointerEvent(element,"down");const handleKeyup=filterEvents(()=>{firePointerEvent(element,"up");});const handleBlur=()=>firePointerEvent(element,"cancel");element.addEventListener("keyup",handleKeyup,eventOptions);element.addEventListener("blur",handleBlur,eventOptions);});element.addEventListener("keydown",handleKeydown,eventOptions);element.addEventListener("blur",()=>element.removeEventListener("keydown",handleKeydown),eventOptions);};function isValidPressEvent(event){return isPrimaryPointer(event)&&!isDragActive();}
function press(targetOrSelector,onPressStart,options={}){const[targets,eventOptions,cancelEvents]=setupGesture(targetOrSelector,options);const startPress=(startEvent)=>{const target=startEvent.currentTarget;if(!isValidPressEvent(startEvent))
return;isPressing.add(target);const onPressEnd=onPressStart(target,startEvent);const onPointerEnd=(endEvent,success)=>{window.removeEventListener("pointerup",onPointerUp);window.removeEventListener("pointercancel",onPointerCancel);if(isPressing.has(target)){isPressing.delete(target);}
if(!isValidPressEvent(endEvent)){return;}
if(typeof onPressEnd==="function"){onPressEnd(endEvent,{success});}};const onPointerUp=(upEvent)=>{onPointerEnd(upEvent,target===window||target===document||options.useGlobalTarget||isNodeOrChild(target,upEvent.target));};const onPointerCancel=(cancelEvent)=>{onPointerEnd(cancelEvent,false);};window.addEventListener("pointerup",onPointerUp,eventOptions);window.addEventListener("pointercancel",onPointerCancel,eventOptions);};targets.forEach((target)=>{const pointerDownTarget=options.useGlobalTarget?window:target;pointerDownTarget.addEventListener("pointerdown",startPress,eventOptions);if(isHTMLElement(target)){target.addEventListener("focus",(event)=>enableKeyboardPress(event,eventOptions));if(!isElementKeyboardAccessible(target)&&!target.hasAttribute("tabindex")){target.tabIndex=0;}}});return cancelEvents;}
function getComputedStyle$2(element,name){const computedStyle=window.getComputedStyle(element);return isCSSVar(name)?computedStyle.getPropertyValue(name):computedStyle[name];}
function isSVGElement(element){return isObject(element)&&"ownerSVGElement"in element;}
const resizeHandlers=new WeakMap();let observer;const getSize=(borderBoxAxis,svgAxis,htmlAxis)=>(target,borderBoxSize)=>{if(borderBoxSize&&borderBoxSize[0]){return borderBoxSize[0][(borderBoxAxis+"Size")];}
else if(isSVGElement(target)&&"getBBox"in target){return target.getBBox()[svgAxis];}
else{return target[htmlAxis];}};const getWidth=/*@__PURE__*/ getSize("inline","width","offsetWidth");const getHeight=/*@__PURE__*/ getSize("block","height","offsetHeight");function notifyTarget({target,borderBoxSize}){resizeHandlers.get(target)?.forEach((handler)=>{handler(target,{get width(){return getWidth(target,borderBoxSize);},get height(){return getHeight(target,borderBoxSize);},});});}
function notifyAll(entries){entries.forEach(notifyTarget);}
function createResizeObserver(){if(typeof ResizeObserver==="undefined")
return;observer=new ResizeObserver(notifyAll);}
function resizeElement(target,handler){if(!observer)
createResizeObserver();const elements=resolveElements(target);elements.forEach((element)=>{let elementHandlers=resizeHandlers.get(element);if(!elementHandlers){elementHandlers=new Set();resizeHandlers.set(element,elementHandlers);}
elementHandlers.add(handler);observer?.observe(element);});return()=>{elements.forEach((element)=>{const elementHandlers=resizeHandlers.get(element);elementHandlers?.delete(handler);if(!elementHandlers?.size){observer?.unobserve(element);}});};}
const windowCallbacks=new Set();let windowResizeHandler;function createWindowResizeHandler(){windowResizeHandler=()=>{const info={get width(){return window.innerWidth;},get height(){return window.innerHeight;},};windowCallbacks.forEach((callback)=>callback(info));};window.addEventListener("resize",windowResizeHandler);}
function resizeWindow(callback){windowCallbacks.add(callback);if(!windowResizeHandler)
createWindowResizeHandler();return()=>{windowCallbacks.delete(callback);if(!windowCallbacks.size&&typeof windowResizeHandler==="function"){window.removeEventListener("resize",windowResizeHandler);windowResizeHandler=undefined;}};}
function resize(a,b){return typeof a==="function"?resizeWindow(a):resizeElement(a,b);}
function observeTimeline(update,timeline){let prevProgress;const onFrame=()=>{const{currentTime}=timeline;const percentage=currentTime===null?0:currentTime.value;const progress=percentage / 100;if(prevProgress!==progress){update(progress);}
prevProgress=progress;};frame.preUpdate(onFrame,true);return()=>cancelFrame(onFrame);}
function record(){const{value}=statsBuffer;if(value===null){cancelFrame(record);return;}
value.frameloop.rate.push(frameData.delta);value.animations.mainThread.push(activeAnimations.mainThread);value.animations.waapi.push(activeAnimations.waapi);value.animations.layout.push(activeAnimations.layout);}
function mean(values){return values.reduce((acc,value)=>acc+value,0)/ values.length;}
function summarise(values,calcAverage=mean){if(values.length===0){return{min:0,max:0,avg:0,};}
return{min:Math.min(...values),max:Math.max(...values),avg:calcAverage(values),};}
const msToFps=(ms)=>Math.round(1000 / ms);function clearStatsBuffer(){statsBuffer.value=null;statsBuffer.addProjectionMetrics=null;}
function reportStats(){const{value}=statsBuffer;if(!value){throw new Error("Stats are not being measured");}
clearStatsBuffer();cancelFrame(record);const summary={frameloop:{setup:summarise(value.frameloop.setup),rate:summarise(value.frameloop.rate),read:summarise(value.frameloop.read),resolveKeyframes:summarise(value.frameloop.resolveKeyframes),preUpdate:summarise(value.frameloop.preUpdate),update:summarise(value.frameloop.update),preRender:summarise(value.frameloop.preRender),render:summarise(value.frameloop.render),postRender:summarise(value.frameloop.postRender),},animations:{mainThread:summarise(value.animations.mainThread),waapi:summarise(value.animations.waapi),layout:summarise(value.animations.layout),},layoutProjection:{nodes:summarise(value.layoutProjection.nodes),calculatedTargetDeltas:summarise(value.layoutProjection.calculatedTargetDeltas),calculatedProjections:summarise(value.layoutProjection.calculatedProjections),},};const{rate}=summary.frameloop;rate.min=msToFps(rate.min);rate.max=msToFps(rate.max);rate.avg=msToFps(rate.avg);[rate.min,rate.max]=[rate.max,rate.min];return summary;}
function recordStats(){if(statsBuffer.value){clearStatsBuffer();throw new Error("Stats are already being measured");}
const newStatsBuffer=statsBuffer;newStatsBuffer.value={frameloop:{setup:[],rate:[],read:[],resolveKeyframes:[],preUpdate:[],update:[],preRender:[],render:[],postRender:[],},animations:{mainThread:[],waapi:[],layout:[],},layoutProjection:{nodes:[],calculatedTargetDeltas:[],calculatedProjections:[],},};newStatsBuffer.addProjectionMetrics=(metrics)=>{const{layoutProjection}=newStatsBuffer.value;layoutProjection.nodes.push(metrics.nodes);layoutProjection.calculatedTargetDeltas.push(metrics.calculatedTargetDeltas);layoutProjection.calculatedProjections.push(metrics.calculatedProjections);};frame.postRender(record,true);return reportStats;}
function isSVGSVGElement(element){return isSVGElement(element)&&element.tagName==="svg";}
function getOriginIndex(from,total){if(from==="first"){return 0;}
else{const lastIndex=total-1;return from==="last"?lastIndex:lastIndex / 2;}}
function stagger(duration=0.1,{startDelay=0,from=0,ease}={}){return(i,total)=>{const fromIndex=typeof from==="number"?from:getOriginIndex(from,total);const distance=Math.abs(fromIndex-i);let delay=duration*distance;if(ease){const maxDelay=total*duration;const easingFunction=easingDefinitionToFunction(ease);delay=easingFunction(delay / maxDelay)*maxDelay;}
return startDelay+delay;};}
function transform(...args){const useImmediate=!Array.isArray(args[0]);const argOffset=useImmediate?0:-1;const inputValue=args[0+argOffset];const inputRange=args[1+argOffset];const outputRange=args[2+argOffset];const options=args[3+argOffset];const interpolator=interpolate(inputRange,outputRange,options);return useImmediate?interpolator(inputValue):interpolator;}
function subscribeValue(inputValues,outputValue,getLatest){const update=()=>outputValue.set(getLatest());const scheduleUpdate=()=>frame.preRender(update,false,true);const subscriptions=inputValues.map((v)=>v.on("change",scheduleUpdate));outputValue.on("destroy",()=>{subscriptions.forEach((unsubscribe)=>unsubscribe());cancelFrame(update);});}
function transformValue(transform){const collectedValues=[];collectMotionValues.current=collectedValues;const initialValue=transform();collectMotionValues.current=undefined;const value=motionValue(initialValue);subscribeValue(collectedValues,value,transform);return value;}
function mapValue(inputValue,inputRange,outputRange,options){const map=transform(inputRange,outputRange,options);return transformValue(()=>map(inputValue.get()));}
const isMotionValue=(value)=>Boolean(value&&value.getVelocity);function springValue(source,options){const initialValue=isMotionValue(source)?source.get():source;const value=motionValue(initialValue);attachSpring(value,source,options);return value;}
function attachSpring(value,source,options){const initialValue=value.get();let activeAnimation=null;let latestValue=initialValue;let latestSetter;const unit=typeof initialValue==="string"?initialValue.replace(/[\d.-]/g,""):undefined;const stopAnimation=()=>{if(activeAnimation){activeAnimation.stop();activeAnimation=null;}};const startAnimation=()=>{stopAnimation();activeAnimation=new JSAnimation({keyframes:[asNumber(value.get()),asNumber(latestValue)],velocity:value.getVelocity(),type:"spring",restDelta:0.001,restSpeed:0.01,...options,onUpdate:latestSetter,});};value.attach((v,set)=>{latestValue=v;latestSetter=(latest)=>set(parseValue(latest,unit));frame.postRender(startAnimation);},stopAnimation);if(isMotionValue(source)){const removeSourceOnChange=source.on("change",(v)=>value.set(parseValue(v,unit)));const removeValueOnDestroy=value.on("destroy",removeSourceOnChange);return()=>{removeSourceOnChange();removeValueOnDestroy();};}
return stopAnimation;}
function parseValue(v,unit){return unit?v+unit:v;}
function asNumber(v){return typeof v==="number"?v:parseFloat(v);}
const valueTypes=[...dimensionValueTypes,color,complex];const findValueType=(v)=>valueTypes.find(testValueType(v));function chooseLayerType(valueName){if(valueName==="layout")
return"group";if(valueName==="enter"||valueName==="new")
return"new";if(valueName==="exit"||valueName==="old")
return"old";return"group";}
let pendingRules={};let style=null;const css={set:(selector,values)=>{pendingRules[selector]=values;},commit:()=>{if(!style){style=document.createElement("style");style.id="motion-view";}
let cssText="";for(const selector in pendingRules){const rule=pendingRules[selector];cssText+=`${selector} {\n`;for(const[property,value]of Object.entries(rule)){cssText+=`  ${property}: ${value};\n`;}
cssText+="}\n";}
style.textContent=cssText;document.head.appendChild(style);pendingRules={};},remove:()=>{if(style&&style.parentElement){style.parentElement.removeChild(style);}},};function getViewAnimationLayerInfo(pseudoElement){const match=pseudoElement.match(/::view-transition-(old|new|group|image-pair)\((.*?)\)/);if(!match)
return null;return{layer:match[2],type:match[1]};}
function filterViewAnimations(animation){const{effect}=animation;if(!effect)
return false;return(effect.target===document.documentElement&&effect.pseudoElement?.startsWith("::view-transition"));}
function getViewAnimations(){return document.getAnimations().filter(filterViewAnimations);}
function hasTarget(target,targets){return targets.has(target)&&Object.keys(targets.get(target)).length>0;}
const definitionNames=["layout","enter","exit","new","old"];function startViewAnimation(builder){const{update,targets,options:defaultOptions}=builder;if(!document.startViewTransition){return new Promise(async(resolve)=>{await update();resolve(new GroupAnimation([]));});}
if(!hasTarget("root",targets)){css.set(":root",{"view-transition-name":"none",});}
css.set("::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*)",{"animation-timing-function":"linear !important"});css.commit();const transition=document.startViewTransition(async()=>{await update();});transition.finished.finally(()=>{css.remove();});return new Promise((resolve)=>{transition.ready.then(()=>{const generatedViewAnimations=getViewAnimations();const animations=[];targets.forEach((definition,target)=>{for(const key of definitionNames){if(!definition[key])
continue;const{keyframes,options}=definition[key];for(let[valueName,valueKeyframes]of Object.entries(keyframes)){if(!valueKeyframes)
continue;const valueOptions={...getValueTransition$1(defaultOptions,valueName),...getValueTransition$1(options,valueName),};const type=chooseLayerType(key);if(valueName==="opacity"&&!Array.isArray(valueKeyframes)){const initialValue=type==="new"?0:1;valueKeyframes=[initialValue,valueKeyframes];}
if(typeof valueOptions.delay==="function"){valueOptions.delay=valueOptions.delay(0,1);}
valueOptions.duration&&(valueOptions.duration=secondsToMilliseconds(valueOptions.duration));valueOptions.delay&&(valueOptions.delay=secondsToMilliseconds(valueOptions.delay));const animation=new NativeAnimation({...valueOptions,element:document.documentElement,name:valueName,pseudoElement:`::view-transition-${type}(${target})`,keyframes:valueKeyframes,});animations.push(animation);}}});for(const animation of generatedViewAnimations){if(animation.playState==="finished")
continue;const{effect}=animation;if(!effect||!(effect instanceof KeyframeEffect))
continue;const{pseudoElement}=effect;if(!pseudoElement)
continue;const name=getViewAnimationLayerInfo(pseudoElement);if(!name)
continue;const targetDefinition=targets.get(name.layer);if(!targetDefinition){const transitionName=name.type==="group"?"layout":"";let animationTransition={...getValueTransition$1(defaultOptions,transitionName),};animationTransition.duration&&(animationTransition.duration=secondsToMilliseconds(animationTransition.duration));animationTransition=applyGeneratorOptions(animationTransition);const easing=mapEasingToNativeEasing(animationTransition.ease,animationTransition.duration);effect.updateTiming({delay:secondsToMilliseconds(animationTransition.delay??0),duration:animationTransition.duration,easing,});animations.push(new NativeAnimationWrapper(animation));}
else if(hasOpacity(targetDefinition,"enter")&&hasOpacity(targetDefinition,"exit")&&effect.getKeyframes().some((keyframe)=>keyframe.mixBlendMode)){animations.push(new NativeAnimationWrapper(animation));}
else{animation.cancel();}}
resolve(new GroupAnimation(animations));});});}
function hasOpacity(target,key){return target?.[key]?.keyframes.opacity;}
let builders=[];let current=null;function next(){current=null;const[nextBuilder]=builders;if(nextBuilder)
start(nextBuilder);}
function start(builder){removeItem(builders,builder);current=builder;startViewAnimation(builder).then((animation)=>{builder.notifyReady(animation);animation.finished.finally(next);});}
function processQueue(){for(let i=builders.length-1;i>=0;i--){const builder=builders[i];const{interrupt}=builder.options;if(interrupt==="immediate"){const batchedUpdates=builders.slice(0,i+1).map((b)=>b.update);const remaining=builders.slice(i+1);builder.update=()=>{batchedUpdates.forEach((update)=>update());};builders=[builder,...remaining];break;}}
if(!current||builders[0]?.options.interrupt==="immediate"){next();}}
function addToQueue(builder){builders.push(builder);microtask.render(processQueue);}
class ViewTransitionBuilder{constructor(update,options={}){this.currentSubject="root";this.targets=new Map();this.notifyReady=noop;this.readyPromise=new Promise((resolve)=>{this.notifyReady=resolve;});this.update=update;this.options={interrupt:"wait",...options,};addToQueue(this);}
get(subject){this.currentSubject=subject;return this;}
layout(keyframes,options){this.updateTarget("layout",keyframes,options);return this;}
new(keyframes,options){this.updateTarget("new",keyframes,options);return this;}
old(keyframes,options){this.updateTarget("old",keyframes,options);return this;}
enter(keyframes,options){this.updateTarget("enter",keyframes,options);return this;}
exit(keyframes,options){this.updateTarget("exit",keyframes,options);return this;}
crossfade(options){this.updateTarget("enter",{opacity:1},options);this.updateTarget("exit",{opacity:0},options);return this;}
updateTarget(target,keyframes,options={}){const{currentSubject,targets}=this;if(!targets.has(currentSubject)){targets.set(currentSubject,{});}
const targetData=targets.get(currentSubject);targetData[target]={keyframes,options};}
then(resolve,reject){return this.readyPromise.then(resolve,reject);}}
function animateView(update,defaultOptions={}){return new ViewTransitionBuilder(update,defaultOptions);}
const sync=frame;const cancelSync=stepsOrder.reduce((acc,key)=>{acc[key]=(process)=>cancelFrame(process);return acc;},{});function isDOMKeyframes(keyframes){return typeof keyframes==="object"&&!Array.isArray(keyframes);}
function resolveSubjects(subject,keyframes,scope,selectorCache){if(typeof subject==="string"&&isDOMKeyframes(keyframes)){return resolveElements(subject,scope,selectorCache);}
else if(subject instanceof NodeList){return Array.from(subject);}
else if(Array.isArray(subject)){return subject;}
else{return[subject];}}
function calculateRepeatDuration(duration,repeat,_repeatDelay){return duration*(repeat+1);}
function calcNextTime(current,next,prev,labels){if(typeof next==="number"){return next;}
else if(next.startsWith("-")||next.startsWith("+")){return Math.max(0,current+parseFloat(next));}
else if(next==="<"){return prev;}
else if(next.startsWith("<")){return Math.max(0,prev+parseFloat(next.slice(1)));}
else{return labels.get(next)??current;}}
function eraseKeyframes(sequence,startTime,endTime){for(let i=0;i<sequence.length;i++){const keyframe=sequence[i];if(keyframe.at>startTime&&keyframe.at<endTime){removeItem(sequence,keyframe);i--;}}}
function addKeyframes(sequence,keyframes,easing,offset,startTime,endTime){eraseKeyframes(sequence,startTime,endTime);for(let i=0;i<keyframes.length;i++){sequence.push({value:keyframes[i],at:mixNumber$1(startTime,endTime,offset[i]),easing:getEasingForSegment(easing,i),});}}
function normalizeTimes(times,repeat){for(let i=0;i<times.length;i++){times[i]=times[i]/(repeat+1);}}
function compareByTime(a,b){if(a.at===b.at){if(a.value===null)
return 1;if(b.value===null)
return-1;return 0;}
else{return a.at-b.at;}}
const defaultSegmentEasing="easeInOut";const MAX_REPEAT=20;function createAnimationsFromSequence(sequence,{defaultTransition={},...sequenceTransition}={},scope,generators){const defaultDuration=defaultTransition.duration||0.3;const animationDefinitions=new Map();const sequences=new Map();const elementCache={};const timeLabels=new Map();let prevTime=0;let currentTime=0;let totalDuration=0;for(let i=0;i<sequence.length;i++){const segment=sequence[i];if(typeof segment==="string"){timeLabels.set(segment,currentTime);continue;}
else if(!Array.isArray(segment)){timeLabels.set(segment.name,calcNextTime(currentTime,segment.at,prevTime,timeLabels));continue;}
let[subject,keyframes,transition={}]=segment;if(transition.at!==undefined){currentTime=calcNextTime(currentTime,transition.at,prevTime,timeLabels);}
let maxDuration=0;const resolveValueSequence=(valueKeyframes,valueTransition,valueSequence,elementIndex=0,numSubjects=0)=>{const valueKeyframesAsList=keyframesAsList(valueKeyframes);const{delay=0,times=defaultOffset$1(valueKeyframesAsList),type="keyframes",repeat,repeatType,repeatDelay=0,...remainingTransition}=valueTransition;let{ease=defaultTransition.ease||"easeOut",duration}=valueTransition;const calculatedDelay=typeof delay==="function"?delay(elementIndex,numSubjects):delay;const numKeyframes=valueKeyframesAsList.length;const createGenerator=isGenerator(type)?type:generators?.[type||"keyframes"];if(numKeyframes<=2&&createGenerator){let absoluteDelta=100;if(numKeyframes===2&&isNumberKeyframesArray(valueKeyframesAsList)){const delta=valueKeyframesAsList[1]-valueKeyframesAsList[0];absoluteDelta=Math.abs(delta);}
const springTransition={...remainingTransition};if(duration!==undefined){springTransition.duration=secondsToMilliseconds(duration);}
const springEasing=createGeneratorEasing(springTransition,absoluteDelta,createGenerator);ease=springEasing.ease;duration=springEasing.duration;}
duration??(duration=defaultDuration);const startTime=currentTime+calculatedDelay;if(times.length===1&&times[0]===0){times[1]=1;}
const remainder=times.length-valueKeyframesAsList.length;remainder>0&&fillOffset(times,remainder);valueKeyframesAsList.length===1&&valueKeyframesAsList.unshift(null);if(repeat){exports.invariant(repeat<MAX_REPEAT,"Repeat count too high, must be less than 20","repeat-count-high");duration=calculateRepeatDuration(duration,repeat);const originalKeyframes=[...valueKeyframesAsList];const originalTimes=[...times];ease=Array.isArray(ease)?[...ease]:[ease];const originalEase=[...ease];for(let repeatIndex=0;repeatIndex<repeat;repeatIndex++){valueKeyframesAsList.push(...originalKeyframes);for(let keyframeIndex=0;keyframeIndex<originalKeyframes.length;keyframeIndex++){times.push(originalTimes[keyframeIndex]+(repeatIndex+1));ease.push(keyframeIndex===0?"linear":getEasingForSegment(originalEase,keyframeIndex-1));}}
normalizeTimes(times,repeat);}
const targetTime=startTime+duration;addKeyframes(valueSequence,valueKeyframesAsList,ease,times,startTime,targetTime);maxDuration=Math.max(calculatedDelay+duration,maxDuration);totalDuration=Math.max(targetTime,totalDuration);};if(isMotionValue(subject)){const subjectSequence=getSubjectSequence(subject,sequences);resolveValueSequence(keyframes,transition,getValueSequence("default",subjectSequence));}
else{const subjects=resolveSubjects(subject,keyframes,scope,elementCache);const numSubjects=subjects.length;for(let subjectIndex=0;subjectIndex<numSubjects;subjectIndex++){keyframes=keyframes;transition=transition;const thisSubject=subjects[subjectIndex];const subjectSequence=getSubjectSequence(thisSubject,sequences);for(const key in keyframes){resolveValueSequence(keyframes[key],getValueTransition(transition,key),getValueSequence(key,subjectSequence),subjectIndex,numSubjects);}}}
prevTime=currentTime;currentTime+=maxDuration;}
sequences.forEach((valueSequences,element)=>{for(const key in valueSequences){const valueSequence=valueSequences[key];valueSequence.sort(compareByTime);const keyframes=[];const valueOffset=[];const valueEasing=[];for(let i=0;i<valueSequence.length;i++){const{at,value,easing}=valueSequence[i];keyframes.push(value);valueOffset.push(progress(0,totalDuration,at));valueEasing.push(easing||"easeOut");}
if(valueOffset[0]!==0){valueOffset.unshift(0);keyframes.unshift(keyframes[0]);valueEasing.unshift(defaultSegmentEasing);}
if(valueOffset[valueOffset.length-1]!==1){valueOffset.push(1);keyframes.push(null);}
if(!animationDefinitions.has(element)){animationDefinitions.set(element,{keyframes:{},transition:{},});}
const definition=animationDefinitions.get(element);definition.keyframes[key]=keyframes;definition.transition[key]={...defaultTransition,duration:totalDuration,ease:valueEasing,times:valueOffset,...sequenceTransition,};}});return animationDefinitions;}
function getSubjectSequence(subject,sequences){!sequences.has(subject)&&sequences.set(subject,{});return sequences.get(subject);}
function getValueSequence(name,sequences){if(!sequences[name])
sequences[name]=[];return sequences[name];}
function keyframesAsList(keyframes){return Array.isArray(keyframes)?keyframes:[keyframes];}
function getValueTransition(transition,key){return transition&&transition[key]?{...transition,...transition[key],}:{...transition};}
const isNumber=(keyframe)=>typeof keyframe==="number";const isNumberKeyframesArray=(keyframes)=>keyframes.every(isNumber);const visualElementStore=new WeakMap();const isKeyframesTarget=(v)=>{return Array.isArray(v);};function getValueState(visualElement){const state=[{},{}];visualElement?.values.forEach((value,key)=>{state[0][key]=value.get();state[1][key]=value.getVelocity();});return state;}
function resolveVariantFromProps(props,definition,custom,visualElement){if(typeof definition==="function"){const[current,velocity]=getValueState(visualElement);definition=definition(custom!==undefined?custom:props.custom,current,velocity);}
if(typeof definition==="string"){definition=props.variants&&props.variants[definition];}
if(typeof definition==="function"){const[current,velocity]=getValueState(visualElement);definition=definition(custom!==undefined?custom:props.custom,current,velocity);}
return definition;}
function resolveVariant(visualElement,definition,custom){const props=visualElement.getProps();return resolveVariantFromProps(props,definition,props.custom,visualElement);}
function setMotionValue(visualElement,key,value){if(visualElement.hasValue(key)){visualElement.getValue(key).set(value);}
else{visualElement.addValue(key,motionValue(value));}}
function resolveFinalValueInKeyframes(v){return isKeyframesTarget(v)?v[v.length-1]||0:v;}
function setTarget(visualElement,definition){const resolved=resolveVariant(visualElement,definition);let{transitionEnd={},transition={},...target}=resolved||{};target={...target,...transitionEnd};for(const key in target){const value=resolveFinalValueInKeyframes(target[key]);setMotionValue(visualElement,key,value);}}
function isWillChangeMotionValue(value){return Boolean(isMotionValue(value)&&value.add);}
function addValueToWillChange(visualElement,key){const willChange=visualElement.getValue("willChange");if(isWillChangeMotionValue(willChange)){return willChange.add(key);}
else if(!willChange&&MotionGlobalConfig.WillChange){const newWillChange=new MotionGlobalConfig.WillChange("auto");visualElement.addValue("willChange",newWillChange);newWillChange.add(key);}}
const camelToDash=(str)=>str.replace(/([a-z])([A-Z])/gu,"$1-$2").toLowerCase();const optimizedAppearDataId="framerAppearId";const optimizedAppearDataAttribute="data-"+camelToDash(optimizedAppearDataId);function getOptimisedAppearId(visualElement){return visualElement.props[optimizedAppearDataAttribute];}
const isNotNull=(value)=>value!==null;function getFinalKeyframe(keyframes,{repeat,repeatType="loop"},finalKeyframe){const resolvedKeyframes=keyframes.filter(isNotNull);const index=repeat&&repeatType!=="loop"&&repeat%2===1?0:resolvedKeyframes.length-1;return!index||finalKeyframe===undefined?resolvedKeyframes[index]:finalKeyframe;}
const underDampedSpring={type:"spring",stiffness:500,damping:25,restSpeed:10,};const criticallyDampedSpring=(target)=>({type:"spring",stiffness:550,damping:target===0?2*Math.sqrt(550):30,restSpeed:10,});const keyframesTransition={type:"keyframes",duration:0.8,};const ease={type:"keyframes",ease:[0.25,0.1,0.35,1],duration:0.3,};const getDefaultTransition=(valueKey,{keyframes})=>{if(keyframes.length>2){return keyframesTransition;}
else if(transformProps.has(valueKey)){return valueKey.startsWith("scale")?criticallyDampedSpring(keyframes[1]):underDampedSpring;}
return ease;};function isTransitionDefined({when,delay:_delay,delayChildren,staggerChildren,staggerDirection,repeat,repeatType,repeatDelay,from,elapsed,...transition}){return!!Object.keys(transition).length;}
const animateMotionValue=(name,value,target,transition={},element,isHandoff)=>(onComplete)=>{const valueTransition=getValueTransition$1(transition,name)||{};const delay=valueTransition.delay||transition.delay||0;let{elapsed=0}=transition;elapsed=elapsed-secondsToMilliseconds(delay);const options={keyframes:Array.isArray(target)?target:[null,target],ease:"easeOut",velocity:value.getVelocity(),...valueTransition,delay:-elapsed,onUpdate:(v)=>{value.set(v);valueTransition.onUpdate&&valueTransition.onUpdate(v);},onComplete:()=>{onComplete();valueTransition.onComplete&&valueTransition.onComplete();},name,motionValue:value,element:isHandoff?undefined:element,};if(!isTransitionDefined(valueTransition)){Object.assign(options,getDefaultTransition(name,options));}
options.duration&&(options.duration=secondsToMilliseconds(options.duration));options.repeatDelay&&(options.repeatDelay=secondsToMilliseconds(options.repeatDelay));if(options.from!==undefined){options.keyframes[0]=options.from;}
let shouldSkip=false;if(options.type===false||(options.duration===0&&!options.repeatDelay)){makeAnimationInstant(options);if(options.delay===0){shouldSkip=true;}}
if(MotionGlobalConfig.instantAnimations||MotionGlobalConfig.skipAnimations){shouldSkip=true;makeAnimationInstant(options);options.delay=0;}
options.allowFlatten=!valueTransition.type&&!valueTransition.ease;if(shouldSkip&&!isHandoff&&value.get()!==undefined){const finalKeyframe=getFinalKeyframe(options.keyframes,valueTransition);if(finalKeyframe!==undefined){frame.update(()=>{options.onUpdate(finalKeyframe);options.onComplete();});return;}}
return valueTransition.isSync?new JSAnimation(options):new AsyncMotionValueAnimation(options);};function shouldBlockAnimation({protectedKeys,needsAnimating},key){const shouldBlock=protectedKeys.hasOwnProperty(key)&&needsAnimating[key]!==true;needsAnimating[key]=false;return shouldBlock;}
function animateTarget(visualElement,targetAndTransition,{delay=0,transitionOverride,type}={}){let{transition=visualElement.getDefaultTransition(),transitionEnd,...target}=targetAndTransition;if(transitionOverride)
transition=transitionOverride;const animations=[];const animationTypeState=type&&visualElement.animationState&&visualElement.animationState.getState()[type];for(const key in target){const value=visualElement.getValue(key,visualElement.latestValues[key]??null);const valueTarget=target[key];if(valueTarget===undefined||(animationTypeState&&shouldBlockAnimation(animationTypeState,key))){continue;}
const valueTransition={delay,...getValueTransition$1(transition||{},key),};const currentValue=value.get();if(currentValue!==undefined&&!value.isAnimating&&!Array.isArray(valueTarget)&&valueTarget===currentValue&&!valueTransition.velocity){continue;}
let isHandoff=false;if(window.MotionHandoffAnimation){const appearId=getOptimisedAppearId(visualElement);if(appearId){const startTime=window.MotionHandoffAnimation(appearId,key,frame);if(startTime!==null){valueTransition.startTime=startTime;isHandoff=true;}}}
addValueToWillChange(visualElement,key);value.start(animateMotionValue(key,value,valueTarget,visualElement.shouldReduceMotion&&positionalKeys.has(key)?{type:false}:valueTransition,visualElement,isHandoff));const animation=value.animation;if(animation){animations.push(animation);}}
if(transitionEnd){Promise.all(animations).then(()=>{frame.update(()=>{transitionEnd&&setTarget(visualElement,transitionEnd);});});}
return animations;}
function convertBoundingBoxToBox({top,left,right,bottom,}){return{x:{min:left,max:right},y:{min:top,max:bottom},};}
function transformBoxPoints(point,transformPoint){if(!transformPoint)
return point;const topLeft=transformPoint({x:point.left,y:point.top});const bottomRight=transformPoint({x:point.right,y:point.bottom});return{top:topLeft.y,left:topLeft.x,bottom:bottomRight.y,right:bottomRight.x,};}
function measureViewportBox(instance,transformPoint){return convertBoundingBoxToBox(transformBoxPoints(instance.getBoundingClientRect(),transformPoint));}
const featureProps={animation:["animate","variants","whileHover","whileTap","exit","whileInView","whileFocus","whileDrag",],exit:["exit"],drag:["drag","dragControls"],focus:["whileFocus"],hover:["whileHover","onHoverStart","onHoverEnd"],tap:["whileTap","onTap","onTapStart","onTapCancel"],pan:["onPan","onPanStart","onPanSessionStart","onPanEnd"],inView:["whileInView","onViewportEnter","onViewportLeave"],layout:["layout","layoutId"],};const featureDefinitions={};for(const key in featureProps){featureDefinitions[key]={isEnabled:(props)=>featureProps[key].some((name)=>!!props[name]),};}
const createAxis=()=>({min:0,max:0});const createBox=()=>({x:createAxis(),y:createAxis(),});const isBrowser=typeof window!=="undefined";const prefersReducedMotion={current:null};const hasReducedMotionListener={current:false};function initPrefersReducedMotion(){hasReducedMotionListener.current=true;if(!isBrowser)
return;if(window.matchMedia){const motionMediaQuery=window.matchMedia("(prefers-reduced-motion)");const setReducedMotionPreferences=()=>(prefersReducedMotion.current=motionMediaQuery.matches);motionMediaQuery.addEventListener("change",setReducedMotionPreferences);setReducedMotionPreferences();}
else{prefersReducedMotion.current=false;}}
function isAnimationControls(v){return(v!==null&&typeof v==="object"&&typeof v.start==="function");}
function isVariantLabel(v){return typeof v==="string"||Array.isArray(v);}
const variantPriorityOrder=["animate","whileInView","whileFocus","whileHover","whileTap","whileDrag","exit",];const variantProps=["initial",...variantPriorityOrder];function isControllingVariants(props){return(isAnimationControls(props.animate)||variantProps.some((name)=>isVariantLabel(props[name])));}
function isVariantNode(props){return Boolean(isControllingVariants(props)||props.variants);}
function updateMotionValuesFromProps(element,next,prev){for(const key in next){const nextValue=next[key];const prevValue=prev[key];if(isMotionValue(nextValue)){element.addValue(key,nextValue);}
else if(isMotionValue(prevValue)){element.addValue(key,motionValue(nextValue,{owner:element}));}
else if(prevValue!==nextValue){if(element.hasValue(key)){const existingValue=element.getValue(key);if(existingValue.liveStyle===true){existingValue.jump(nextValue);}
else if(!existingValue.hasAnimated){existingValue.set(nextValue);}}
else{const latestValue=element.getStaticValue(key);element.addValue(key,motionValue(latestValue!==undefined?latestValue:nextValue,{owner:element}));}}}
for(const key in prev){if(next[key]===undefined)
element.removeValue(key);}
return next;}
const propEventHandlers=["AnimationStart","AnimationComplete","Update","BeforeLayoutMeasure","LayoutMeasure","LayoutAnimationStart","LayoutAnimationComplete",];class VisualElement{scrapeMotionValuesFromProps(_props,_prevProps,_visualElement){return{};}
constructor({parent,props,presenceContext,reducedMotionConfig,blockInitialAnimation,visualState,},options={}){this.current=null;this.children=new Set();this.isVariantNode=false;this.isControllingVariants=false;this.shouldReduceMotion=null;this.values=new Map();this.KeyframeResolver=KeyframeResolver;this.features={};this.valueSubscriptions=new Map();this.prevMotionValues={};this.events={};this.propEventSubscriptions={};this.notifyUpdate=()=>this.notify("Update",this.latestValues);this.render=()=>{if(!this.current)
return;this.triggerBuild();this.renderInstance(this.current,this.renderState,this.props.style,this.projection);};this.renderScheduledAt=0.0;this.scheduleRender=()=>{const now=time.now();if(this.renderScheduledAt<now){this.renderScheduledAt=now;frame.render(this.render,false,true);}};const{latestValues,renderState}=visualState;this.latestValues=latestValues;this.baseTarget={...latestValues};this.initialValues=props.initial?{...latestValues}:{};this.renderState=renderState;this.parent=parent;this.props=props;this.presenceContext=presenceContext;this.depth=parent?parent.depth+1:0;this.reducedMotionConfig=reducedMotionConfig;this.options=options;this.blockInitialAnimation=Boolean(blockInitialAnimation);this.isControllingVariants=isControllingVariants(props);this.isVariantNode=isVariantNode(props);if(this.isVariantNode){this.variantChildren=new Set();}
this.manuallyAnimateOnMount=Boolean(parent&&parent.current);const{willChange,...initialMotionValues}=this.scrapeMotionValuesFromProps(props,{},this);for(const key in initialMotionValues){const value=initialMotionValues[key];if(latestValues[key]!==undefined&&isMotionValue(value)){value.set(latestValues[key]);}}}
mount(instance){this.current=instance;visualElementStore.set(instance,this);if(this.projection&&!this.projection.instance){this.projection.mount(instance);}
if(this.parent&&this.isVariantNode&&!this.isControllingVariants){this.removeFromVariantTree=this.parent.addVariantChild(this);}
this.values.forEach((value,key)=>this.bindToMotionValue(key,value));if(!hasReducedMotionListener.current){initPrefersReducedMotion();}
this.shouldReduceMotion=this.reducedMotionConfig==="never"?false:this.reducedMotionConfig==="always"?true:prefersReducedMotion.current;{warnOnce(this.shouldReduceMotion!==true,"You have Reduced Motion enabled on your device. Animations may not appear as expected.","reduced-motion-disabled");}
this.parent?.addChild(this);this.update(this.props,this.presenceContext);}
unmount(){this.projection&&this.projection.unmount();cancelFrame(this.notifyUpdate);cancelFrame(this.render);this.valueSubscriptions.forEach((remove)=>remove());this.valueSubscriptions.clear();this.removeFromVariantTree&&this.removeFromVariantTree();this.parent?.removeChild(this);for(const key in this.events){this.events[key].clear();}
for(const key in this.features){const feature=this.features[key];if(feature){feature.unmount();feature.isMounted=false;}}
this.current=null;}
addChild(child){this.children.add(child);this.enteringChildren??(this.enteringChildren=new Set());this.enteringChildren.add(child);}
removeChild(child){this.children.delete(child);this.enteringChildren&&this.enteringChildren.delete(child);}
bindToMotionValue(key,value){if(this.valueSubscriptions.has(key)){this.valueSubscriptions.get(key)();}
const valueIsTransform=transformProps.has(key);if(valueIsTransform&&this.onBindTransform){this.onBindTransform();}
const removeOnChange=value.on("change",(latestValue)=>{this.latestValues[key]=latestValue;this.props.onUpdate&&frame.preRender(this.notifyUpdate);if(valueIsTransform&&this.projection){this.projection.isTransformDirty=true;}
this.scheduleRender();});let removeSyncCheck;if(window.MotionCheckAppearSync){removeSyncCheck=window.MotionCheckAppearSync(this,key,value);}
this.valueSubscriptions.set(key,()=>{removeOnChange();if(removeSyncCheck)
removeSyncCheck();if(value.owner)
value.stop();});}
sortNodePosition(other){if(!this.current||!this.sortInstanceNodePosition||this.type!==other.type){return 0;}
return this.sortInstanceNodePosition(this.current,other.current);}
updateFeatures(){let key="animation";for(key in featureDefinitions){const featureDefinition=featureDefinitions[key];if(!featureDefinition)
continue;const{isEnabled,Feature:FeatureConstructor}=featureDefinition;if(!this.features[key]&&FeatureConstructor&&isEnabled(this.props)){this.features[key]=new FeatureConstructor(this);}
if(this.features[key]){const feature=this.features[key];if(feature.isMounted){feature.update();}
else{feature.mount();feature.isMounted=true;}}}}
triggerBuild(){this.build(this.renderState,this.latestValues,this.props);}
measureViewportBox(){return this.current?this.measureInstanceViewportBox(this.current,this.props):createBox();}
getStaticValue(key){return this.latestValues[key];}
setStaticValue(key,value){this.latestValues[key]=value;}
update(props,presenceContext){if(props.transformTemplate||this.props.transformTemplate){this.scheduleRender();}
this.prevProps=this.props;this.props=props;this.prevPresenceContext=this.presenceContext;this.presenceContext=presenceContext;for(let i=0;i<propEventHandlers.length;i++){const key=propEventHandlers[i];if(this.propEventSubscriptions[key]){this.propEventSubscriptions[key]();delete this.propEventSubscriptions[key];}
const listenerName=("on"+key);const listener=props[listenerName];if(listener){this.propEventSubscriptions[key]=this.on(key,listener);}}
this.prevMotionValues=updateMotionValuesFromProps(this,this.scrapeMotionValuesFromProps(props,this.prevProps,this),this.prevMotionValues);if(this.handleChildMotionValue){this.handleChildMotionValue();}}
getProps(){return this.props;}
getVariant(name){return this.props.variants?this.props.variants[name]:undefined;}
getDefaultTransition(){return this.props.transition;}
getTransformPagePoint(){return this.props.transformPagePoint;}
getClosestVariantNode(){return this.isVariantNode?this:this.parent?this.parent.getClosestVariantNode():undefined;}
addVariantChild(child){const closestVariantNode=this.getClosestVariantNode();if(closestVariantNode){closestVariantNode.variantChildren&&closestVariantNode.variantChildren.add(child);return()=>closestVariantNode.variantChildren.delete(child);}}
addValue(key,value){const existingValue=this.values.get(key);if(value!==existingValue){if(existingValue)
this.removeValue(key);this.bindToMotionValue(key,value);this.values.set(key,value);this.latestValues[key]=value.get();}}
removeValue(key){this.values.delete(key);const unsubscribe=this.valueSubscriptions.get(key);if(unsubscribe){unsubscribe();this.valueSubscriptions.delete(key);}
delete this.latestValues[key];this.removeValueFromRenderState(key,this.renderState);}
hasValue(key){return this.values.has(key);}
getValue(key,defaultValue){if(this.props.values&&this.props.values[key]){return this.props.values[key];}
let value=this.values.get(key);if(value===undefined&&defaultValue!==undefined){value=motionValue(defaultValue===null?undefined:defaultValue,{owner:this});this.addValue(key,value);}
return value;}
readValue(key,target){let value=this.latestValues[key]!==undefined||!this.current?this.latestValues[key]:this.getBaseTargetFromProps(this.props,key)??this.readValueFromInstance(this.current,key,this.options);if(value!==undefined&&value!==null){if(typeof value==="string"&&(isNumericalString(value)||isZeroValueString(value))){value=parseFloat(value);}
else if(!findValueType(value)&&complex.test(target)){value=getAnimatableNone(key,target);}
this.setBaseTarget(key,isMotionValue(value)?value.get():value);}
return isMotionValue(value)?value.get():value;}
setBaseTarget(key,value){this.baseTarget[key]=value;}
getBaseTarget(key){const{initial}=this.props;let valueFromInitial;if(typeof initial==="string"||typeof initial==="object"){const variant=resolveVariantFromProps(this.props,initial,this.presenceContext?.custom);if(variant){valueFromInitial=variant[key];}}
if(initial&&valueFromInitial!==undefined){return valueFromInitial;}
const target=this.getBaseTargetFromProps(this.props,key);if(target!==undefined&&!isMotionValue(target))
return target;return this.initialValues[key]!==undefined&&valueFromInitial===undefined?undefined:this.baseTarget[key];}
on(eventName,callback){if(!this.events[eventName]){this.events[eventName]=new SubscriptionManager();}
return this.events[eventName].add(callback);}
notify(eventName,...args){if(this.events[eventName]){this.events[eventName].notify(...args);}}
scheduleRenderMicrotask(){microtask.render(this.render);}}
class DOMVisualElement extends VisualElement{constructor(){super(...arguments);this.KeyframeResolver=DOMKeyframesResolver;}
sortInstanceNodePosition(a,b){return a.compareDocumentPosition(b)&2?1:-1;}
getBaseTargetFromProps(props,key){return props.style?props.style[key]:undefined;}
removeValueFromRenderState(key,{vars,style}){delete vars[key];delete style[key];}
handleChildMotionValue(){if(this.childSubscription){this.childSubscription();delete this.childSubscription;}
const{children}=this.props;if(isMotionValue(children)){this.childSubscription=children.on("change",(latest)=>{if(this.current){this.current.textContent=`${latest}`;}});}}}
const translateAlias={x:"translateX",y:"translateY",z:"translateZ",transformPerspective:"perspective",};const numTransforms=transformPropOrder.length;function buildTransform(latestValues,transform,transformTemplate){let transformString="";let transformIsDefault=true;for(let i=0;i<numTransforms;i++){const key=transformPropOrder[i];const value=latestValues[key];if(value===undefined)
continue;let valueIsDefault=true;if(typeof value==="number"){valueIsDefault=value===(key.startsWith("scale")?1:0);}
else{valueIsDefault=parseFloat(value)===0;}
if(!valueIsDefault||transformTemplate){const valueAsType=getValueAsType(value,numberValueTypes[key]);if(!valueIsDefault){transformIsDefault=false;const transformName=translateAlias[key]||key;transformString+=`${transformName}(${valueAsType}) `;}
if(transformTemplate){transform[key]=valueAsType;}}}
transformString=transformString.trim();if(transformTemplate){transformString=transformTemplate(transform,transformIsDefault?"":transformString);}
else if(transformIsDefault){transformString="none";}
return transformString;}
function buildHTMLStyles(state,latestValues,transformTemplate){const{style,vars,transformOrigin}=state;let hasTransform=false;let hasTransformOrigin=false;for(const key in latestValues){const value=latestValues[key];if(transformProps.has(key)){hasTransform=true;continue;}
else if(isCSSVariableName(key)){vars[key]=value;continue;}
else{const valueAsType=getValueAsType(value,numberValueTypes[key]);if(key.startsWith("origin")){hasTransformOrigin=true;transformOrigin[key]=valueAsType;}
else{style[key]=valueAsType;}}}
if(!latestValues.transform){if(hasTransform||transformTemplate){style.transform=buildTransform(latestValues,state.transform,transformTemplate);}
else if(style.transform){style.transform="none";}}
if(hasTransformOrigin){const{originX="50%",originY="50%",originZ=0,}=transformOrigin;style.transformOrigin=`${originX} ${originY} ${originZ}`;}}
function renderHTML(element,{style,vars},styleProp,projection){const elementStyle=element.style;let key;for(key in style){elementStyle[key]=style[key];}
projection?.applyProjectionStyles(elementStyle,styleProp);for(key in vars){elementStyle.setProperty(key,vars[key]);}}
const scaleCorrectors={};function isForcedMotionValue(key,{layout,layoutId}){return(transformProps.has(key)||key.startsWith("origin")||((layout||layoutId!==undefined)&&(!!scaleCorrectors[key]||key==="opacity")));}
function scrapeMotionValuesFromProps$1(props,prevProps,visualElement){const{style}=props;const newValues={};for(const key in style){if(isMotionValue(style[key])||(prevProps.style&&isMotionValue(prevProps.style[key]))||isForcedMotionValue(key,props)||visualElement?.getValue(key)?.liveStyle!==undefined){newValues[key]=style[key];}}
return newValues;}
function getComputedStyle$1(element){return window.getComputedStyle(element);}
class HTMLVisualElement extends DOMVisualElement{constructor(){super(...arguments);this.type="html";this.renderInstance=renderHTML;}
readValueFromInstance(instance,key){if(transformProps.has(key)){return this.projection?.isProjecting?defaultTransformValue(key):readTransformValue(instance,key);}
else{const computedStyle=getComputedStyle$1(instance);const value=(isCSSVariableName(key)?computedStyle.getPropertyValue(key):computedStyle[key])||0;return typeof value==="string"?value.trim():value;}}
measureInstanceViewportBox(instance,{transformPagePoint}){return measureViewportBox(instance,transformPagePoint);}
build(renderState,latestValues,props){buildHTMLStyles(renderState,latestValues,props.transformTemplate);}
scrapeMotionValuesFromProps(props,prevProps,visualElement){return scrapeMotionValuesFromProps$1(props,prevProps,visualElement);}}
function isObjectKey(key,object){return key in object;}
class ObjectVisualElement extends VisualElement{constructor(){super(...arguments);this.type="object";}
readValueFromInstance(instance,key){if(isObjectKey(key,instance)){const value=instance[key];if(typeof value==="string"||typeof value==="number"){return value;}}
return undefined;}
getBaseTargetFromProps(){return undefined;}
removeValueFromRenderState(key,renderState){delete renderState.output[key];}
measureInstanceViewportBox(){return createBox();}
build(renderState,latestValues){Object.assign(renderState.output,latestValues);}
renderInstance(instance,{output}){Object.assign(instance,output);}
sortInstanceNodePosition(){return 0;}}
const dashKeys={offset:"stroke-dashoffset",array:"stroke-dasharray",};const camelKeys={offset:"strokeDashoffset",array:"strokeDasharray",};function buildSVGPath(attrs,length,spacing=1,offset=0,useDashCase=true){attrs.pathLength=1;const keys=useDashCase?dashKeys:camelKeys;attrs[keys.offset]=px.transform(-offset);const pathLength=px.transform(length);const pathSpacing=px.transform(spacing);attrs[keys.array]=`${pathLength} ${pathSpacing}`;}
function buildSVGAttrs(state,{attrX,attrY,attrScale,pathLength,pathSpacing=1,pathOffset=0,...latest},isSVGTag,transformTemplate,styleProp){buildHTMLStyles(state,latest,transformTemplate);if(isSVGTag){if(state.style.viewBox){state.attrs.viewBox=state.style.viewBox;}
return;}
state.attrs=state.style;state.style={};const{attrs,style}=state;if(attrs.transform){style.transform=attrs.transform;delete attrs.transform;}
if(style.transform||attrs.transformOrigin){style.transformOrigin=attrs.transformOrigin??"50% 50%";delete attrs.transformOrigin;}
if(style.transform){style.transformBox=styleProp?.transformBox??"fill-box";delete attrs.transformBox;}
if(attrX!==undefined)
attrs.x=attrX;if(attrY!==undefined)
attrs.y=attrY;if(attrScale!==undefined)
attrs.scale=attrScale;if(pathLength!==undefined){buildSVGPath(attrs,pathLength,pathSpacing,pathOffset,false);}}
const camelCaseAttributes=new Set(["baseFrequency","diffuseConstant","kernelMatrix","kernelUnitLength","keySplines","keyTimes","limitingConeAngle","markerHeight","markerWidth","numOctaves","targetX","targetY","surfaceScale","specularConstant","specularExponent","stdDeviation","tableValues","viewBox","gradientTransform","pathLength","startOffset","textLength","lengthAdjust",]);const isSVGTag=(tag)=>typeof tag==="string"&&tag.toLowerCase()==="svg";function renderSVG(element,renderState,_styleProp,projection){renderHTML(element,renderState,undefined,projection);for(const key in renderState.attrs){element.setAttribute(!camelCaseAttributes.has(key)?camelToDash(key):key,renderState.attrs[key]);}}
function scrapeMotionValuesFromProps(props,prevProps,visualElement){const newValues=scrapeMotionValuesFromProps$1(props,prevProps,visualElement);for(const key in props){if(isMotionValue(props[key])||isMotionValue(prevProps[key])){const targetKey=transformPropOrder.indexOf(key)!==-1?"attr"+key.charAt(0).toUpperCase()+key.substring(1):key;newValues[targetKey]=props[key];}}
return newValues;}
class SVGVisualElement extends DOMVisualElement{constructor(){super(...arguments);this.type="svg";this.isSVGTag=false;this.measureInstanceViewportBox=createBox;}
getBaseTargetFromProps(props,key){return props[key];}
readValueFromInstance(instance,key){if(transformProps.has(key)){const defaultType=getDefaultValueType(key);return defaultType?defaultType.default||0:0;}
key=!camelCaseAttributes.has(key)?camelToDash(key):key;return instance.getAttribute(key);}
scrapeMotionValuesFromProps(props,prevProps,visualElement){return scrapeMotionValuesFromProps(props,prevProps,visualElement);}
build(renderState,latestValues,props){buildSVGAttrs(renderState,latestValues,this.isSVGTag,props.transformTemplate,props.style);}
renderInstance(instance,renderState,styleProp,projection){renderSVG(instance,renderState,styleProp,projection);}
mount(instance){this.isSVGTag=isSVGTag(instance.tagName);super.mount(instance);}}
function createDOMVisualElement(element){const options={presenceContext:null,props:{},visualState:{renderState:{transform:{},transformOrigin:{},style:{},vars:{},attrs:{},},latestValues:{},},};const node=isSVGElement(element)&&!isSVGSVGElement(element)?new SVGVisualElement(options):new HTMLVisualElement(options);node.mount(element);visualElementStore.set(element,node);}
function createObjectVisualElement(subject){const options={presenceContext:null,props:{},visualState:{renderState:{output:{},},latestValues:{},},};const node=new ObjectVisualElement(options);node.mount(subject);visualElementStore.set(subject,node);}
function animateSingleValue(value,keyframes,options){const motionValue$1=isMotionValue(value)?value:motionValue(value);motionValue$1.start(animateMotionValue("",motionValue$1,keyframes,options));return motionValue$1.animation;}
function isSingleValue(subject,keyframes){return(isMotionValue(subject)||typeof subject==="number"||(typeof subject==="string"&&!isDOMKeyframes(keyframes)));}
function animateSubject(subject,keyframes,options,scope){const animations=[];if(isSingleValue(subject,keyframes)){animations.push(animateSingleValue(subject,isDOMKeyframes(keyframes)?keyframes.default||keyframes:keyframes,options?options.default||options:options));}
else{const subjects=resolveSubjects(subject,keyframes,scope);const numSubjects=subjects.length;exports.invariant(Boolean(numSubjects),"No valid elements provided.","no-valid-elements");for(let i=0;i<numSubjects;i++){const thisSubject=subjects[i];exports.invariant(thisSubject!==null,"You're trying to perform an animation on null. Ensure that selectors are correctly finding elements and refs are correctly hydrated.","animate-null");const createVisualElement=thisSubject instanceof Element?createDOMVisualElement:createObjectVisualElement;if(!visualElementStore.has(thisSubject)){createVisualElement(thisSubject);}
const visualElement=visualElementStore.get(thisSubject);const transition={...options};if("delay"in transition&&typeof transition.delay==="function"){transition.delay=transition.delay(i,numSubjects);}
animations.push(...animateTarget(visualElement,{...keyframes,transition},{}));}}
return animations;}
function animateSequence(sequence,options,scope){const animations=[];const animationDefinitions=createAnimationsFromSequence(sequence,options,scope,{spring});animationDefinitions.forEach(({keyframes,transition},subject)=>{animations.push(...animateSubject(subject,keyframes,transition));});return animations;}
function isSequence(value){return Array.isArray(value)&&value.some(Array.isArray);}
function createScopedAnimate(scope){function scopedAnimate(subjectOrSequence,optionsOrKeyframes,options){let animations=[];let animationOnComplete;if(isSequence(subjectOrSequence)){animations=animateSequence(subjectOrSequence,optionsOrKeyframes,scope);}
else{const{onComplete,...rest}=options||{};if(typeof onComplete==="function"){animationOnComplete=onComplete;}
animations=animateSubject(subjectOrSequence,optionsOrKeyframes,rest,scope);}
const animation=new GroupAnimationWithThen(animations);if(animationOnComplete){animation.finished.then(animationOnComplete);}
if(scope){scope.animations.push(animation);animation.finished.then(()=>{removeItem(scope.animations,animation);});}
return animation;}
return scopedAnimate;}
const animate=createScopedAnimate();function animateElements(elementOrSelector,keyframes,options,scope){const elements=resolveElements(elementOrSelector,scope);const numElements=elements.length;exports.invariant(Boolean(numElements),"No valid elements provided.","no-valid-elements");const animationDefinitions=[];for(let i=0;i<numElements;i++){const element=elements[i];const elementTransition={...options};if(typeof elementTransition.delay==="function"){elementTransition.delay=elementTransition.delay(i,numElements);}
for(const valueName in keyframes){let valueKeyframes=keyframes[valueName];if(!Array.isArray(valueKeyframes)){valueKeyframes=[valueKeyframes];}
const valueOptions={...getValueTransition$1(elementTransition,valueName),};valueOptions.duration&&(valueOptions.duration=secondsToMilliseconds(valueOptions.duration));valueOptions.delay&&(valueOptions.delay=secondsToMilliseconds(valueOptions.delay));const map=getAnimationMap(element);const key=animationMapKey(valueName,valueOptions.pseudoElement||"");const currentAnimation=map.get(key);currentAnimation&&currentAnimation.stop();animationDefinitions.push({map,key,unresolvedKeyframes:valueKeyframes,options:{...valueOptions,element,name:valueName,allowFlatten:!elementTransition.type&&!elementTransition.ease,},});}}
for(let i=0;i<animationDefinitions.length;i++){const{unresolvedKeyframes,options:animationOptions}=animationDefinitions[i];const{element,name,pseudoElement}=animationOptions;if(!pseudoElement&&unresolvedKeyframes[0]===null){unresolvedKeyframes[0]=getComputedStyle$2(element,name);}
fillWildcards(unresolvedKeyframes);applyPxDefaults(unresolvedKeyframes,name);if(!pseudoElement&&unresolvedKeyframes.length<2){unresolvedKeyframes.unshift(getComputedStyle$2(element,name));}
animationOptions.keyframes=unresolvedKeyframes;}
const animations=[];for(let i=0;i<animationDefinitions.length;i++){const{map,key,options:animationOptions}=animationDefinitions[i];const animation=new NativeAnimation(animationOptions);map.set(key,animation);animation.finished.finally(()=>map.delete(key));animations.push(animation);}
return animations;}
const createScopedWaapiAnimate=(scope)=>{function scopedAnimate(elementOrSelector,keyframes,options){return new GroupAnimationWithThen(animateElements(elementOrSelector,keyframes,options,scope));}
return scopedAnimate;};const animateMini=/*@__PURE__*/ createScopedWaapiAnimate();const maxElapsed=50;const createAxisInfo=()=>({current:0,offset:[],progress:0,scrollLength:0,targetOffset:0,targetLength:0,containerLength:0,velocity:0,});const createScrollInfo=()=>({time:0,x:createAxisInfo(),y:createAxisInfo(),});const keys={x:{length:"Width",position:"Left",},y:{length:"Height",position:"Top",},};function updateAxisInfo(element,axisName,info,time){const axis=info[axisName];const{length,position}=keys[axisName];const prev=axis.current;const prevTime=info.time;axis.current=element[`scroll${position}`];axis.scrollLength=element[`scroll${length}`]-element[`client${length}`];axis.offset.length=0;axis.offset[0]=0;axis.offset[1]=axis.scrollLength;axis.progress=progress(0,axis.scrollLength,axis.current);const elapsed=time-prevTime;axis.velocity=elapsed>maxElapsed?0:velocityPerSecond(axis.current-prev,elapsed);}
function updateScrollInfo(element,info,time){updateAxisInfo(element,"x",info,time);updateAxisInfo(element,"y",info,time);info.time=time;}
function calcInset(element,container){const inset={x:0,y:0};let current=element;while(current&&current!==container){if(isHTMLElement(current)){inset.x+=current.offsetLeft;inset.y+=current.offsetTop;current=current.offsetParent;}
else if(current.tagName==="svg"){const svgBoundingBox=current.getBoundingClientRect();current=current.parentElement;const parentBoundingBox=current.getBoundingClientRect();inset.x+=svgBoundingBox.left-parentBoundingBox.left;inset.y+=svgBoundingBox.top-parentBoundingBox.top;}
else if(current instanceof SVGGraphicsElement){const{x,y}=current.getBBox();inset.x+=x;inset.y+=y;let svg=null;let parent=current.parentNode;while(!svg){if(parent.tagName==="svg"){svg=parent;}
parent=current.parentNode;}
current=svg;}
else{break;}}
return inset;}
const namedEdges={start:0,center:0.5,end:1,};function resolveEdge(edge,length,inset=0){let delta=0;if(edge in namedEdges){edge=namedEdges[edge];}
if(typeof edge==="string"){const asNumber=parseFloat(edge);if(edge.endsWith("px")){delta=asNumber;}
else if(edge.endsWith("%")){edge=asNumber / 100;}
else if(edge.endsWith("vw")){delta=(asNumber / 100)*document.documentElement.clientWidth;}
else if(edge.endsWith("vh")){delta=(asNumber / 100)*document.documentElement.clientHeight;}
else{edge=asNumber;}}
if(typeof edge==="number"){delta=length*edge;}
return inset+delta;}
const defaultOffset=[0,0];function resolveOffset(offset,containerLength,targetLength,targetInset){let offsetDefinition=Array.isArray(offset)?offset:defaultOffset;let targetPoint=0;let containerPoint=0;if(typeof offset==="number"){offsetDefinition=[offset,offset];}
else if(typeof offset==="string"){offset=offset.trim();if(offset.includes(" ")){offsetDefinition=offset.split(" ");}
else{offsetDefinition=[offset,namedEdges[offset]?offset:`0`];}}
targetPoint=resolveEdge(offsetDefinition[0],targetLength,targetInset);containerPoint=resolveEdge(offsetDefinition[1],containerLength);return targetPoint-containerPoint;}
const ScrollOffset={Enter:[[0,1],[1,1],],Exit:[[0,0],[1,0],],Any:[[1,0],[0,1],],All:[[0,0],[1,1],],};const point={x:0,y:0};function getTargetSize(target){return"getBBox"in target&&target.tagName!=="svg"?target.getBBox():{width:target.clientWidth,height:target.clientHeight};}
function resolveOffsets(container,info,options){const{offset:offsetDefinition=ScrollOffset.All}=options;const{target=container,axis="y"}=options;const lengthLabel=axis==="y"?"height":"width";const inset=target!==container?calcInset(target,container):point;const targetSize=target===container?{width:container.scrollWidth,height:container.scrollHeight}:getTargetSize(target);const containerSize={width:container.clientWidth,height:container.clientHeight,};info[axis].offset.length=0;let hasChanged=!info[axis].interpolate;const numOffsets=offsetDefinition.length;for(let i=0;i<numOffsets;i++){const offset=resolveOffset(offsetDefinition[i],containerSize[lengthLabel],targetSize[lengthLabel],inset[axis]);if(!hasChanged&&offset!==info[axis].interpolatorOffsets[i]){hasChanged=true;}
info[axis].offset[i]=offset;}
if(hasChanged){info[axis].interpolate=interpolate(info[axis].offset,defaultOffset$1(offsetDefinition),{clamp:false});info[axis].interpolatorOffsets=[...info[axis].offset];}
info[axis].progress=clamp(0,1,info[axis].interpolate(info[axis].current));}
function measure(container,target=container,info){info.x.targetOffset=0;info.y.targetOffset=0;if(target!==container){let node=target;while(node&&node!==container){info.x.targetOffset+=node.offsetLeft;info.y.targetOffset+=node.offsetTop;node=node.offsetParent;}}
info.x.targetLength=target===container?target.scrollWidth:target.clientWidth;info.y.targetLength=target===container?target.scrollHeight:target.clientHeight;info.x.containerLength=container.clientWidth;info.y.containerLength=container.clientHeight;{if(container&&target&&target!==container){warnOnce(getComputedStyle(container).position!=="static","Please ensure that the container has a non-static position, like 'relative', 'fixed', or 'absolute' to ensure scroll offset is calculated correctly.");}}}
function createOnScrollHandler(element,onScroll,info,options={}){return{measure:(time)=>{measure(element,options.target,info);updateScrollInfo(element,info,time);if(options.offset||options.target){resolveOffsets(element,info,options);}},notify:()=>onScroll(info),};}
const scrollListeners=new WeakMap();const resizeListeners=new WeakMap();const onScrollHandlers=new WeakMap();const getEventTarget=(element)=>element===document.scrollingElement?window:element;function scrollInfo(onScroll,{container=document.scrollingElement,...options}={}){if(!container)
return noop;let containerHandlers=onScrollHandlers.get(container);if(!containerHandlers){containerHandlers=new Set();onScrollHandlers.set(container,containerHandlers);}
const info=createScrollInfo();const containerHandler=createOnScrollHandler(container,onScroll,info,options);containerHandlers.add(containerHandler);if(!scrollListeners.has(container)){const measureAll=()=>{for(const handler of containerHandlers){handler.measure(frameData.timestamp);}
frame.preUpdate(notifyAll);};const notifyAll=()=>{for(const handler of containerHandlers){handler.notify();}};const listener=()=>frame.read(measureAll);scrollListeners.set(container,listener);const target=getEventTarget(container);window.addEventListener("resize",listener,{passive:true});if(container!==document.documentElement){resizeListeners.set(container,resize(container,listener));}
target.addEventListener("scroll",listener,{passive:true});listener();}
const listener=scrollListeners.get(container);frame.read(listener,false,true);return()=>{cancelFrame(listener);const currentHandlers=onScrollHandlers.get(container);if(!currentHandlers)
return;currentHandlers.delete(containerHandler);if(currentHandlers.size)
return;const scrollListener=scrollListeners.get(container);scrollListeners.delete(container);if(scrollListener){getEventTarget(container).removeEventListener("scroll",scrollListener);resizeListeners.get(container)?.();window.removeEventListener("resize",scrollListener);}};}
const timelineCache=new Map();function scrollTimelineFallback(options){const currentTime={value:0};const cancel=scrollInfo((info)=>{currentTime.value=info[options.axis].progress*100;},options);return{currentTime,cancel};}
function getTimeline({source,container,...options}){const{axis}=options;if(source)
container=source;const containerCache=timelineCache.get(container)??new Map();timelineCache.set(container,containerCache);const targetKey=options.target??"self";const targetCache=containerCache.get(targetKey)??{};const axisKey=axis+(options.offset??[]).join(",");if(!targetCache[axisKey]){targetCache[axisKey]=!options.target&&supportsScrollTimeline()?new ScrollTimeline({source:container,axis}):scrollTimelineFallback({container,...options});}
return targetCache[axisKey];}
function attachToAnimation(animation,options){const timeline=getTimeline(options);return animation.attachTimeline({timeline:options.target?undefined:timeline,observe:(valueAnimation)=>{valueAnimation.pause();return observeTimeline((progress)=>{valueAnimation.time=valueAnimation.iterationDuration*progress;},timeline);},});}
function isOnScrollWithInfo(onScroll){return onScroll.length===2;}
function attachToFunction(onScroll,options){if(isOnScrollWithInfo(onScroll)){return scrollInfo((info)=>{onScroll(info[options.axis].progress,info);},options);}
else{return observeTimeline(onScroll,getTimeline(options));}}
function scroll(onScroll,{axis="y",container=document.scrollingElement,...options}={}){if(!container)
return noop;const optionsWithDefaults={axis,container,...options};return typeof onScroll==="function"?attachToFunction(onScroll,optionsWithDefaults):attachToAnimation(onScroll,optionsWithDefaults);}
const thresholds={some:0,all:1,};function inView(elementOrSelector,onStart,{root,margin:rootMargin,amount="some"}={}){const elements=resolveElements(elementOrSelector);const activeIntersections=new WeakMap();const onIntersectionChange=(entries)=>{entries.forEach((entry)=>{const onEnd=activeIntersections.get(entry.target);if(entry.isIntersecting===Boolean(onEnd))
return;if(entry.isIntersecting){const newOnEnd=onStart(entry.target,entry);if(typeof newOnEnd==="function"){activeIntersections.set(entry.target,newOnEnd);}
else{observer.unobserve(entry.target);}}
else if(typeof onEnd==="function"){onEnd(entry);activeIntersections.delete(entry.target);}});};const observer=new IntersectionObserver(onIntersectionChange,{root,rootMargin,threshold:typeof amount==="number"?amount:thresholds[amount],});elements.forEach((element)=>observer.observe(element));return()=>observer.disconnect();}
function delay(callback,timeout){const start=time.now();const checkElapsed=({timestamp})=>{const elapsed=timestamp-start;if(elapsed>=timeout){cancelFrame(checkElapsed);callback(elapsed-timeout);}};frame.setup(checkElapsed,true);return()=>cancelFrame(checkElapsed);}
function delayInSeconds(callback,timeout){return delay(callback,secondsToMilliseconds(timeout));}
const distance=(a,b)=>Math.abs(a-b);function distance2D(a,b){const xDelta=distance(a.x,b.x);const yDelta=distance(a.y,b.y);return Math.sqrt(xDelta**2+yDelta**2);}
exports.AsyncMotionValueAnimation=AsyncMotionValueAnimation;exports.DOMKeyframesResolver=DOMKeyframesResolver;exports.GroupAnimation=GroupAnimation;exports.GroupAnimationWithThen=GroupAnimationWithThen;exports.JSAnimation=JSAnimation;exports.KeyframeResolver=KeyframeResolver;exports.MotionGlobalConfig=MotionGlobalConfig;exports.MotionValue=MotionValue;exports.NativeAnimation=NativeAnimation;exports.NativeAnimationExtended=NativeAnimationExtended;exports.NativeAnimationWrapper=NativeAnimationWrapper;exports.SubscriptionManager=SubscriptionManager;exports.ViewTransitionBuilder=ViewTransitionBuilder;exports.acceleratedValues=acceleratedValues;exports.activeAnimations=activeAnimations;exports.addAttrValue=addAttrValue;exports.addStyleValue=addStyleValue;exports.addUniqueItem=addUniqueItem;exports.alpha=alpha;exports.analyseComplexValue=analyseComplexValue;exports.animate=animate;exports.animateMini=animateMini;exports.animateValue=animateValue;exports.animateView=animateView;exports.animationMapKey=animationMapKey;exports.anticipate=anticipate;exports.applyGeneratorOptions=applyGeneratorOptions;exports.applyPxDefaults=applyPxDefaults;exports.attachSpring=attachSpring;exports.attrEffect=attrEffect;exports.backIn=backIn;exports.backInOut=backInOut;exports.backOut=backOut;exports.calcGeneratorDuration=calcGeneratorDuration;exports.cancelFrame=cancelFrame;exports.cancelMicrotask=cancelMicrotask;exports.cancelSync=cancelSync;exports.circIn=circIn;exports.circInOut=circInOut;exports.circOut=circOut;exports.clamp=clamp;exports.collectMotionValues=collectMotionValues;exports.color=color;exports.complex=complex;exports.convertOffsetToTimes=convertOffsetToTimes;exports.createGeneratorEasing=createGeneratorEasing;exports.createRenderBatcher=createRenderBatcher;exports.createScopedAnimate=createScopedAnimate;exports.cubicBezier=cubicBezier;exports.cubicBezierAsString=cubicBezierAsString;exports.defaultEasing=defaultEasing;exports.defaultOffset=defaultOffset$1;exports.defaultTransformValue=defaultTransformValue;exports.defaultValueTypes=defaultValueTypes;exports.degrees=degrees;exports.delay=delayInSeconds;exports.dimensionValueTypes=dimensionValueTypes;exports.distance=distance;exports.distance2D=distance2D;exports.easeIn=easeIn;exports.easeInOut=easeInOut;exports.easeOut=easeOut;exports.easingDefinitionToFunction=easingDefinitionToFunction;exports.fillOffset=fillOffset;exports.fillWildcards=fillWildcards;exports.findDimensionValueType=findDimensionValueType;exports.findValueType=findValueType;exports.flushKeyframeResolvers=flushKeyframeResolvers;exports.frame=frame;exports.frameData=frameData;exports.frameSteps=frameSteps;exports.generateLinearEasing=generateLinearEasing;exports.getAnimatableNone=getAnimatableNone;exports.getAnimationMap=getAnimationMap;exports.getComputedStyle=getComputedStyle$2;exports.getDefaultValueType=getDefaultValueType;exports.getEasingForSegment=getEasingForSegment;exports.getMixer=getMixer;exports.getOriginIndex=getOriginIndex;exports.getValueAsType=getValueAsType;exports.getValueTransition=getValueTransition$1;exports.getVariableValue=getVariableValue;exports.getViewAnimationLayerInfo=getViewAnimationLayerInfo;exports.getViewAnimations=getViewAnimations;exports.hasWarned=hasWarned;exports.hex=hex;exports.hover=hover;exports.hsla=hsla;exports.hslaToRgba=hslaToRgba;exports.inView=inView;exports.inertia=inertia;exports.interpolate=interpolate;exports.invisibleValues=invisibleValues;exports.isBezierDefinition=isBezierDefinition;exports.isCSSVariableName=isCSSVariableName;exports.isCSSVariableToken=isCSSVariableToken;exports.isDragActive=isDragActive;exports.isDragging=isDragging;exports.isEasingArray=isEasingArray;exports.isGenerator=isGenerator;exports.isHTMLElement=isHTMLElement;exports.isMotionValue=isMotionValue;exports.isNodeOrChild=isNodeOrChild;exports.isNumericalString=isNumericalString;exports.isObject=isObject;exports.isPrimaryPointer=isPrimaryPointer;exports.isSVGElement=isSVGElement;exports.isSVGSVGElement=isSVGSVGElement;exports.isWaapiSupportedEasing=isWaapiSupportedEasing;exports.isZeroValueString=isZeroValueString;exports.keyframes=keyframes;exports.makeAnimationInstant=makeAnimationInstant;exports.mapEasingToNativeEasing=mapEasingToNativeEasing;exports.mapValue=mapValue;exports.maxGeneratorDuration=maxGeneratorDuration;exports.memo=memo;exports.microtask=microtask;exports.millisecondsToSeconds=millisecondsToSeconds;exports.mirrorEasing=mirrorEasing;exports.mix=mix;exports.mixArray=mixArray;exports.mixColor=mixColor;exports.mixComplex=mixComplex;exports.mixImmediate=mixImmediate;exports.mixLinearColor=mixLinearColor;exports.mixNumber=mixNumber$1;exports.mixObject=mixObject;exports.mixVisibility=mixVisibility;exports.motionValue=motionValue;exports.moveItem=moveItem;exports.noop=noop;exports.number=number;exports.numberValueTypes=numberValueTypes;exports.observeTimeline=observeTimeline;exports.parseCSSVariable=parseCSSVariable;exports.parseValueFromTransform=parseValueFromTransform;exports.percent=percent;exports.pipe=pipe;exports.positionalKeys=positionalKeys;exports.press=press;exports.progress=progress;exports.progressPercentage=progressPercentage;exports.propEffect=propEffect;exports.px=px;exports.readTransformValue=readTransformValue;exports.recordStats=recordStats;exports.removeItem=removeItem;exports.resize=resize;exports.resolveElements=resolveElements;exports.reverseEasing=reverseEasing;exports.rgbUnit=rgbUnit;exports.rgba=rgba;exports.scale=scale;exports.scroll=scroll;exports.scrollInfo=scrollInfo;exports.secondsToMilliseconds=secondsToMilliseconds;exports.setDragLock=setDragLock;exports.setStyle=setStyle;exports.spring=spring;exports.springValue=springValue;exports.stagger=stagger;exports.startWaapiAnimation=startWaapiAnimation;exports.statsBuffer=statsBuffer;exports.steps=steps;exports.styleEffect=styleEffect;exports.supportedWaapiEasing=supportedWaapiEasing;exports.supportsBrowserAnimation=supportsBrowserAnimation;exports.supportsFlags=supportsFlags;exports.supportsLinearEasing=supportsLinearEasing;exports.supportsPartialKeyframes=supportsPartialKeyframes;exports.supportsScrollTimeline=supportsScrollTimeline;exports.svgEffect=svgEffect;exports.sync=sync;exports.testValueType=testValueType;exports.time=time;exports.transform=transform;exports.transformPropOrder=transformPropOrder;exports.transformProps=transformProps;exports.transformValue=transformValue;exports.transformValueTypes=transformValueTypes;exports.velocityPerSecond=velocityPerSecond;exports.vh=vh;exports.vw=vw;exports.warnOnce=warnOnce;exports.wrap=wrap;}));