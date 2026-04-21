/*! elementor-pro - v3.35.0 - 02-02-2026 */"use strict";(self["webpackChunkelementor_pro"]=self["webpackChunkelementor_pro"]||[]).push([["mega-menu-editor"],{"../modules/mega-menu/assets/js/editor/editor-module.js":
/*!**************************************************************!*\
  !*** ../modules/mega-menu/assets/js/editor/editor-module.js ***!
  \**************************************************************/
((module,__unused_webpack_exports,__webpack_require__)=>{const ElementEditorModule=__webpack_require__(/*! elementor-pro/editor/element-editor-module */"../assets/dev/js/editor/element-editor-module.js");module.exports=ElementEditorModule.extend({__construct(){this.cache={};ElementEditorModule.prototype.__construct.apply(this,arguments);},onInit(){elementor.channels.editor.on('editor:widget:mega-menu:section_layout:activated',this.maybeSetContentWidthValue);},maybeSetContentWidthValue(){const contentWidthControlView=this.getEditorControlView('content_width');const contentWidthControlValue=contentWidthControlView.getControlValue();const disallowedValues=['','full','boxed'];if(disallowedValues.includes(contentWidthControlValue)){contentWidthControlView.setValue('full_width');contentWidthControlView.applySavedValue();}}});}),"../modules/mega-menu/assets/js/editor/module.js":
/*!*******************************************************!*\
  !*** ../modules/mega-menu/assets/js/editor/module.js ***!
  \*******************************************************/
((__unused_webpack_module,exports,__webpack_require__)=>{var _interopRequireDefault=__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */"../node_modules/@babel/runtime/helpers/interopRequireDefault.js");Object.defineProperty(exports,"__esModule",({value:true}));exports["default"]=void 0;var _nestedModule=_interopRequireDefault(__webpack_require__(/*! ./nested-module */"../modules/mega-menu/assets/js/editor/nested-module.js"));var _editorModule=_interopRequireDefault(__webpack_require__(/*! ./editor-module */"../modules/mega-menu/assets/js/editor/editor-module.js"));var _urlHelper=_interopRequireDefault(__webpack_require__(/*! ./utils/url-helper */"../modules/mega-menu/assets/js/editor/utils/url-helper.js"));class Module extends elementorModules.editor.utils.Module{constructor(){super();elementor.elementsManager.registerElementType(new _nestedModule.default());new _editorModule.default();this.urlHelper=new _urlHelper.default();}
getCurrentMenuItemClass(menuLinkUrl,permalinkUrl){menuLinkUrl=menuLinkUrl?.trim(menuLinkUrl);if(!menuLinkUrl||!permalinkUrl){return'';}
const permalinkArray=this.urlHelper.parse_url(permalinkUrl),menuItemUrlArray=this.urlHelper.parse_url(menuLinkUrl),hasEqualUrls=_.isEqual(permalinkArray,menuItemUrlArray);return hasEqualUrls?'e-current':'';}
onElementorFrontendInit(){elementor.on('document:loaded',this.closeAllMegaMenus.bind(this));}
closeAllMegaMenus(){const megaMenus=elementor.$previewContents[0].querySelectorAll('.elementor-widget-n-menu');if(megaMenus.length){Array.from(megaMenus).forEach(node=>{const id=node.getAttribute('data-id');window.jQuery(window).trigger('elementor/mega-menu/dropdown-toggle-by-keyboard',{widgetId:id,show:false});});}}}
exports["default"]=Module;}),"../modules/mega-menu/assets/js/editor/nested-module.js":
/*!**************************************************************!*\
  !*** ../modules/mega-menu/assets/js/editor/nested-module.js ***!
  \**************************************************************/
((__unused_webpack_module,exports,__webpack_require__)=>{var _interopRequireDefault=__webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */"../node_modules/@babel/runtime/helpers/interopRequireDefault.js");Object.defineProperty(exports,"__esModule",({value:true}));exports["default"]=exports.NestedModule=void 0;var _view=_interopRequireDefault(__webpack_require__(/*! ./views/view */"../modules/mega-menu/assets/js/editor/views/view.js"));class NestedModule extends elementor.modules.elements.types.NestedElementBase{getType(){return'mega-menu';}
getView(){return _view.default;}}
exports.NestedModule=NestedModule;var _default=exports["default"]=NestedModule;}),"../modules/mega-menu/assets/js/editor/utils/url-helper.js":
/*!*****************************************************************!*\
  !*** ../modules/mega-menu/assets/js/editor/utils/url-helper.js ***!
  \*****************************************************************/
((__unused_webpack_module,exports)=>{Object.defineProperty(exports,"__esModule",({value:true}));exports["default"]=exports.UrlHelper=void 0;class UrlHelper{parse_url(url){try{const{hostname,pathname,search}=new URL(url),host=hostname.replace('www.',''),trailingSlashesRegex=/^\/+|\/+$/g,path=pathname.replace(trailingSlashesRegex,'');return[host,path,search];}catch(err){return false;}}}
exports.UrlHelper=UrlHelper;var _default=exports["default"]=UrlHelper;}),"../modules/mega-menu/assets/js/editor/views/view.js":
/*!***********************************************************!*\
  !*** ../modules/mega-menu/assets/js/editor/views/view.js ***!
  \***********************************************************/
((__unused_webpack_module,exports)=>{Object.defineProperty(exports,"__esModule",({value:true}));exports["default"]=void 0;class View extends $e.components.get('nested-elements').exports.NestedView{constructor(...args){super(...args);this.isRendering=false;this.itemTitle='item_title';this.itemLink='item_link';this.internalUrl='internal-url';this.itemLinkSelector='.elementor-control-item_link';}
filter(child,index){child.attributes.dataIndex=index+1;child.attributes.widgetId=child.id;return true;}
onAddChild(childView){const widgetNumber=childView._parent.$el.find('.e-n-menu')[0]?.dataset.widgetNumber||childView.model.attributes.widgetId,index=childView.model.attributes.dataIndex,tabId=childView._parent.$el.find(`.e-n-menu-item-title[data-tab-index="${index}"]`)?.attr('id')||childView.model.attributes.widgetId+' '+index;childView.$el.attr({id:'e-n-menu-content-'+widgetNumber+''+index,role:'menu','aria-labelledby':tabId,'data-tab-index':index});}
getChildViewContainer(containerView,childView){const{elements_placeholder_selector:customSelector,child_container_placeholder_selector:childContainerSelector}=this.model.config.defaults;if(childView!==undefined&&childView._index!==undefined&&childContainerSelector){return containerView.$el.find(`${childContainerSelector}`)[childView._index];}
if(customSelector){return containerView.$el.find(this.model.config.defaults.elements_placeholder_selector);}
return super.getChildViewContainer(containerView,childView);}
attachBuffer(compositeView,buffer){const $container=this.getChildViewContainer(compositeView);if(this.model?.config?.support_improved_repeaters&&this.model?.config?.is_interlaced){const childContainerSelector=this.model?.config?.defaults?.child_container_placeholder_selector||'',childContainerClass=childContainerSelector.replace('.','');this._updateChildContainers($container[0],childContainerClass,buffer);}else{$container.append(buffer);}}
_updateChildContainers(wrapper,childContainerClass,buffer){_.each(wrapper.children,childContainer=>{if(!childContainer.classList?.contains(childContainerClass)){this._updateChildContainers(childContainer,childContainerClass,buffer);return;}
const numberOfItems=buffer.childNodes.length;if(0===numberOfItems){return;}
childContainer.appendChild(buffer.childNodes[0]);buffer.appendChild(childContainer);wrapper.append(buffer.childNodes[numberOfItems-1]);});}
renderOnChange(settings,widget=[]){if(!this.allowRender){return;}
if(this.isRendering){this.isRendering=false;return;}
const renderResult=this.renderDataBindings(settings,this.dataBindings,widget);if(renderResult instanceof Promise){renderResult.then(result=>{if(!result){this.renderChanges(settings);}});}
if(!renderResult){this.renderChanges(settings);}}
renderDataBindings(settings,dataBindings,widget=[]){if(!this.dataBindings?.length){return false;}
let changed=false;const renderDataBinding=async dataBinding=>{if(undefined!==settings.changed[dataBinding.dataset.bindingSetting]){dataBinding.el.innerHTML=settings.changed[dataBinding.dataset.bindingSetting];return true;}
if(!settings?.changed.__dynamic__||!widget.length){return false;}
if(!this.isTitleOrLinkChanged(settings)){return true;}
const{bindingSetting}=dataBinding.dataset,changedControl=this.getChangedDynamicControlKey(settings);let change=settings.changed[bindingSetting];if(this.isInternalUrl(settings?.changed?.__dynamic__?.item_link)&&this.isSettingChanged(settings,this.itemLink)){return await this.getDynamicValue(settings,changedControl,bindingSetting,dataBinding,widget);}
if(this.isAtomicDynamic(settings.changed,dataBinding,changedControl)){const dynamicValue=await this.getDynamicValue(settings,changedControl,bindingSetting,dataBinding,widget);if(this.itemLink===changedControl){return true;}
if(dynamicValue){change=dynamicValue;}}
if(change!==undefined){dataBinding.el.innerHTML=change;return true;}
return false;};for(const dataBinding of dataBindings){switch(dataBinding.dataset.bindingType){case'repeater-item':{const repeater=this.container.repeaters[dataBinding.dataset.bindingRepeaterName];if(!repeater){break;}
const container=repeater.children.find(i=>i.id===settings.attributes._id);if(container?.parent?.children.indexOf(container)+1===parseInt(dataBinding.dataset.bindingIndex)){changed=renderDataBinding(dataBinding);}else if(dataBindings.indexOf(dataBinding)+1===this.getRepeaterItemActiveIndex()){if(this.isItemLinkChild(widget)){return true;}
changed=this.tryHandleDynamicCoverSettings(dataBinding,settings);}}
break;case'content':{changed=renderDataBinding(dataBinding);}
break;}
if(changed){break;}}
return changed;}
isAtomicDynamic(changedSettings,dataBinding,changedControl){return dataBinding.el.hasAttribute('data-binding-dynamic')&&(this.itemTitle===changedControl||this.itemLink===changedControl);}
async getDynamicValue(settings,changedControlKey,bindingSetting,dataBinding,widget){const dynamicSettings={active:true},valueToParse=this.extractValueToParse(this.getChangedData(settings,changedControlKey,bindingSetting));if(undefined===valueToParse){return settings.attributes[changedControlKey];}
const data=await this.getDataFromCacheOrBackend(valueToParse,dynamicSettings);if(this.itemTitle===changedControlKey){return data;}
if(undefined!==data){this.tryFormatDynamicMegaMenuUrl(valueToParse,dataBinding,widget,changedControlKey,dynamicSettings);}
return settings.attributes[changedControlKey];}
extractValueToParse(valueToParse,keyToExtract='url'){if('object'===typeof valueToParse){return valueToParse[keyToExtract];}
return valueToParse;}
getChangedDynamicControlKey(settings){if(!settings?.changed?.__dynamic__){return Object.keys(settings.changed)[0];}
const changedControlKey=this.findUniqueKey(settings?.changed?.__dynamic__,settings?._previousAttributes?.__dynamic__)[0];if(changedControlKey){return changedControlKey;}
return this.isSettingChanged(settings,this.itemLink)?this.itemLink:this.itemTitle;}
tryFormatDynamicMegaMenuUrl(valueToParse,dataBinding,widget,changedControl,dynamicSettings){const dynamicTagName=this.getDynamicTagName(valueToParse);if(this.itemLink!==changedControl||'internal_link'===dynamicTagName){return false;}
const value=elementor.dynamicTags.parseTagsText(valueToParse,dynamicSettings,elementor.dynamicTags.getTagDataContent);elementor.$preview[0].contentWindow.dispatchEvent(new CustomEvent('elementor/dynamic/url_change',{detail:{element:dataBinding.el,actionName:valueToParse&&dynamicTagName,value}}));dataBinding.el=Array.from(widget)[0].querySelectorAll('.e-n-menu-title-text')[dataBinding.dataset.bindingIndex-1];}
getDynamicTagName(changedDataForAddedItem){const regex=/name="([^"]*)"/;const match=changedDataForAddedItem.match(regex);return match?match[1]:null;}
isInternalUrl(dynamicData){if(!dynamicData){return false;}
return this.internalUrl===this.getDynamicTagName(dynamicData);}
isItemLinkChild(widget){return widget[0].closest(this.itemLinkSelector);}
async getDataFromCacheOrBackend(valueToParse,dynamicSettings){try{return elementor.dynamicTags.parseTagsText(valueToParse,dynamicSettings,elementor.dynamicTags.getTagDataContent);}catch{await new Promise(resolve=>{elementor.dynamicTags.refreshCacheFromServer(()=>{resolve();});});return!_.isEmpty(elementor.dynamicTags.cache)?elementor.dynamicTags.parseTagsText(valueToParse,dynamicSettings,elementor.dynamicTags.getTagDataContent):false;}}
getChangedDataForRemovedItem(settings,changedControlKey,bindingSetting){return settings.attributes?.[changedControlKey]?.[bindingSetting]||settings.attributes?.[changedControlKey];}
getChangedDataForAddedItem(settings,changedControlKey,bindingSetting){return settings.attributes?.__dynamic__?.[changedControlKey]?.[bindingSetting]||settings.attributes?.__dynamic__?.[changedControlKey];}
getChangedData(settings,changedControlKey,bindingSetting){const changedDataForRemovedItem=this.getChangedDataForRemovedItem(settings,changedControlKey,bindingSetting),changedDataForAddedItem=this.getChangedDataForAddedItem(settings,changedControlKey,bindingSetting);return changedDataForAddedItem||changedDataForRemovedItem;}
getTitleWithAdvancedValues(settings,text){const{attributes,_previousAttributes:previousAttributes}=settings;if(this.compareSettings(attributes,previousAttributes,'fallback')){text=text.replace(new RegExp(previousAttributes.fallback),'');}
if(!text||attributes.fallback===text){return attributes.fallback||'';}
if(this.compareSettings(attributes,previousAttributes,'before')){text=text.replace(previousAttributes.before,'');}
if(this.compareSettings(attributes,previousAttributes,'after')){text=text.replace(new RegExp(previousAttributes.after+'$'),'');}
if(!text){return attributes.fallback||'';}
const newBefore=this.getNewSettingsValue(attributes,previousAttributes,'before'),newAfter=this.getNewSettingsValue(attributes,previousAttributes,'after');text=newBefore+text;text+=newAfter;return text;}
compareSettings(attributes,previousAttributes,key){return previousAttributes[key]&&previousAttributes[key]!==attributes[key];}
getNewSettingsValue(attributes,previousAttributes,key){return previousAttributes[key]!==attributes[key]?attributes[key]||'':'';}
getRepeaterItemActiveIndex(){return this.getContainer().renderer.view.model.changed.editSettings.changed.activeItemIndex||this.getContainer().renderer.view.model.changed.editSettings.attributes.activeItemIndex;}
tryHandleDynamicCoverSettings(dataBinding,settings){if(!this.isAdvancedDynamicSettings(settings.attributes)){return false;}
this.isRendering=true;dataBinding.el.textContent=this.getTitleWithAdvancedValues(settings,dataBinding.el.textContent);return true;}
isAdvancedDynamicSettings(attributes){return'before'in attributes&&'after'in attributes&&'fallback'in attributes;}
isSettingChanged(settings,bindingSettings){return settings.attributes.__dynamic__?.[bindingSettings]!==settings._previousAttributes.__dynamic__?.[bindingSettings];}
isTitleOrLinkChanged(settings){return this.isSettingChanged(settings,this.itemTitle)||this.isSettingChanged(settings,this.itemLink);}}
exports["default"]=View;})}]);