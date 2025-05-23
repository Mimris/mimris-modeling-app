// @ts-nocheck

// /**
// * Generate GoJS model and metamodel from the metisobject in the store,
// */
// import * as utils from '../akmm/utilities';
import * as akm from '../akmm/metamodeller';
// import * as gjs from '../akmm/ui_gojs';
// import * as jsn from '../akmm/ui_json';
import * as uib from '../akmm/ui_buildmodels';
// import * as uic from '../akmm/ui_common';
import * as constants from './constants';

const debug = false;

const clogGreen = console.log.bind(console, '%c %s', // green colored cosole log
  'background: green; color: white');
const clogBlue = console.log.bind(console, '%c %s', // green colored cosole log
  'background: blue; color: white');
const ctrace = console.trace.bind(console, '%c %s',
  'background: green; color: white');

const systemtypes = ['Property', 'Method', 'MethodType', 'Datatype', 'Value', 'FieldType', 'InputPattern', 'ViewFormat'];

const GenGojsModel = async (props: any, myMetis: any) => {
  // let myMetis = yourMetis;
  // let goParams = {};
  if (debug) console.log('28 GenGojsModel started', props, myMetis);
  const includeDeleted = (props.phUser?.focusUser) ? props.phUser?.focusUser?.diagram?.showDeleted : false;
  const includeNoObject = (props.phUser?.focusUser) ? props.phUser?.focusUser?.diagram?.showDeleted : false;
  const includeInstancesOnly = (props.phUser?.focusUser) ? props.phUser?.focusUser?.diagram?.showDeleted : false;
  if (debug) console.log('32 GenGojsModel showDeleted', includeDeleted, props.phUser?.focusUser?.diagram?.showModified)
  const showModified = (props.phUser?.focusUser) ? props.phUser?.focusUser?.diagram?.showModified : false;
  const metis = (props.phData) && props.phData.metis; // Todo: check if current model and then load only current model
  const models = (metis) && metis.models.filter((m: any) => (m) && m); // filter out null models
  let focusModel = props.phFocus?.focusModel;
  if (!focusModel) focusModel = (models) && models[0];
  let focusModelview = props.phFocus?.focusModelview;
  if (!focusModelview) focusModelview = (focusModel) && focusModel.modelviews[0];
  if (debug) console.log('37 GenGojsModel focusModel', focusModel, focusModelview);
  let focusObject = props.phFocus?.focusObject;
  let focusObjectview = props.phFocus?.focusObjectview;
  const metamodels = (metis) && metis.metamodels.filter((mm) => (mm) && mm); // filter out null metamodels
  let adminModel;

  if (metis != null) {
    clogGreen('43 GenGojsModel: props', props);
    if (debug) clogGreen('44 GenGojsModel: metis', props.phData.metis);
    const curmod = (models && focusModel?.id) && models.find((m: any) => m.id === focusModel.id) || models[0]; // if focusModel does not exist set it to the first
    const curmodview = (curmod && focusModelview?.id && curmod.modelviews?.find((mv: any) => mv.id === focusModelview.id))
      ? curmod?.modelviews?.find((mv: any) => mv.id === focusModelview.id)
      : curmod?.modelviews[0] // if focusmodview does not exist set it to the first
    const focusTargetModel = (props.phFocus) && props.phFocus.focusTargetModel
    const focusTargetModelview = (props.phFocus) && props.phFocus.focusTargetModelview
    const curtargetmodel = (models && focusTargetModel?.id) && models.find((m: any) => m.id === curmod?.targetModelRef)
    const focustargetmodelview = (curtargetmodel && focusTargetModelview?.id) && curtargetmodel.modelviews.find((mv: any) => mv.id === focusTargetModelview?.id)
    const curtargetmodelview = focustargetmodelview || curtargetmodel?.modelviews[0]

    if (debug) console.log('54 GenGojsModel: curmodview', curmodview, curmod, focusModelview, curmod?.modelviews)

    // const myMetis = new akm.cxMetis();
    // myMetis = props.myMetis;

    if (debug) console.log('51 GenGojsModel: metis', metis, myMetis);
    myMetis?.importData(metis, true);
    adminModel = uib.buildAdminModel(myMetis);

    clogBlue('83 GenGojsModel :', myMetis)
    if (debug) clogBlue('88 GenGojsModel :', '\n currentModelview :', myMetis.currentModelview?.name, ',\n props :', props, '\n myMetis :', myMetis);

    if (curmod && curmod.id) {
      const myModel = myMetis?.findModel(curmod.id);
      if (debug) console.log('71 myModel :', myModel);
      let myModelview = (curmodview) && myModel?.findModelView(curmodview?.id);
      if (debug) console.log('73 myModelview', myModelview);
      let myGoModel = uib.buildGoModel(myMetis, myModel, myModelview, includeDeleted, includeNoObject, showModified);
      if (debug) console.log('75 GenGojsModel myGoModel', myGoModel, myGoModel?.nodes);
      let myMetamodel = myModel?.metamodel;
      if (debug) console.log('77 myMetamodel :', myMetamodel);
      const myGoMetamodel = uib.buildGoMetaModel(myMetamodel, includeDeleted, showModified);
      if (debug) console.log('79 myGoMetamodel', myGoMetamodel);
      const myGoMetamodelPalette = (myMetamodel) && uib.buildGoMetaPalette();
      if (debug) console.log('83 myMetamodelPalette', myMetamodelPalette);
      const myGoPalette = (myMetamodel) && uib.buildGoPalette(myMetamodel, myMetis);
      if (debug) console.log('85 myPalette', myPalette);

      const myTargetModel = myMetis?.findModel(curtargetmodel?.id);
      let myTargetModelview = (curtargetmodelview) && myMetis.findModelView(focusTargetModelview?.id)
      let myTargetMetamodel = myMetis.findMetamodel(curmod.targetMetamodelRef) || null;
      const myGoTargetMetamodel = uib.buildGoPalette(myTargetMetamodel, myMetis)
      if (debug) console.log('81 myTargetMetamodel :', curmod, curmod.targetMetamodelRef, curtargetmodel, myTargetMetamodel);
      const myGoTargetMetamodelPalette = (myTargetMetamodel) && uib.buildGoPalette(myTargetMetamodel, myMetis);
      if (debug) console.log('90 myTargetModelPalette', myTargetMetamodel, myTargetMetamodelPalette);
      const myGoTargetModel = uib.buildGoModel(myMetis, myTargetModel, myTargetModelview, includeDeleted, includeNoObject);
      if (debug) console.log('113 GenGojsModel myGoModel', myMetis, myGoTargetModel, myTargetModel, myTargetModelview);

      if (focusObjectview.id) 
        myModelview?.setFocusObjectview(focusObjectview);
        myMetis?.setGojsModel(myGoModel);
        myMetis?.setCurrentMetamodel(myMetamodel);
        myMetis?.setCurrentModel(myModel);
        myMetis?.setCurrentModelview(myModelview);

      if (debug) console.log('81 GenGojsModel: metis', myMetis.gojsModel);
      if (debug) console.log('121 GenGojsModel  myMetis', myMetis);
      if (debug) console.log('211 Modelling ', props, myMetis, myModel, myModelview, myMetamodel);
      if (!myMetis && !myModel && !myModelview && !myMetamodel) {
        console.error('187 One of the required variables is undefined: myMetis: ', myMetis, 'myModel: ', 'myModelview: ', myModelview, 'myMetamodel: ', myMetamodel);
        return null;
      }

    }
  }
  if (debug) console.log('114 GenGojsModel myMetis', myMetis);
}
export default GenGojsModel;