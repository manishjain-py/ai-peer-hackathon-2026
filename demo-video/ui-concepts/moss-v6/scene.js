import legacy from './legacy-scene.js';
import {createClarityPage} from './clarity-page.js';
let old,page,stage;
export default {captions:[],async init(parent,ctx){stage=parent;old=document.createElement('div');old.style.cssText='position:absolute;inset:0';stage.append(old);await legacy.init(old,ctx);page=createClarityPage(stage);},render(t){window.__mascotTime=t;const active=t>=22;old.style.display=active?'none':'';page.node.style.display=active?'':'none';if(active)page.render(t);else legacy.render(t);}};
