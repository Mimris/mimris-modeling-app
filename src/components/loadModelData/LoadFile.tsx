// @ts-nocheck
import { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip } from 'reactstrap';
import { useDispatch } from 'react-redux'
import { v4 as uuidv4 } from 'uuid';
import Select from "react-select"
import { UniqueDirectiveNamesRule } from 'graphql';

// import { loadData } from '../actions/actions'
// import { loadState, saveState } from '../utils/LocalStorage'
import useLocalStorage from '../../hooks/use-local-storage'
// import { FaJoint } from 'react-icons/fa';
// import DispatchLocal  from '../utils/SetStoreFromLocalStorage'
import GenGojsModel from '../GenGojsModel'
import { ReadModelFromFile, ReadMetamodelFromFile } from '../utils/ReadModelFromFile';
import { SaveModelviewToFile, SaveModelToFile, SaveMetamodelToFile, SaveAllToFile, SaveAllToFileDate } from '../utils/SaveModelToFile';
import CreateNewModel from '../akmm-api/CreateNewModel';
import { ReadConvertJSONFromFile } from '../utils/ConvertJSONToModel';
import { WriteConvertModelToJSONFile } from '../utils/ConvertModelToJSON';

const LoadFile = (props: any) => {

  // if (typeof window === 'undefined') return null
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const [refresh, setRefresh] = useState(false);
  const debug = false
  const dispatch = useDispatch()

  function toggleRefresh() { setRefresh(!refresh); }

  // if (debug) console.log('28 LoadFile', props.ph.phData.metis.models);

  const modelNames = props.ph.phData?.metis?.models?.map((mn, index) => <span key={mn.id + index}>{mn.name} | </span>)
  const metamodelNames = props.ph.phData?.metis?.metamodels?.map((mn, index) => (mn) && <span key={mn.id + index}>{mn.name} | </span>)

  if (debug) console.log('36 LoadLocal', props, typeof (window));

  if (debug) console.log('38 LoadLocal', props.ph.phData, modelNames, metamodelNames);

  const data = {
    phData: {
      ...props.ph.phData,
      metis: {
        ...props.ph.phData.metis,
        models: props.ph.phData.metis.models.filter(m => m),
        metamodels: props.ph.phData.metis.metamodels.filter(mm => mm),
      },
    },
    phFocus: props.ph.phFocus,
    phUser: props.ph.phUser,
    phSource: props.phSource,
    lastUpdate: new Date().toISOString()
  }

  // Save all models and metamodels in current project to a file (no date in name) to the downloads folder
  function handleSaveAllToFile() {
    const projectname = props.ph.phData.metis.name
    if (debug) console.log('37 LoadFile', data);
    SaveAllToFile(data, projectname, '_PR')
    // SaveAllToFile(data, projectname, 'AKMM-Project')
  }

  // Save all models and metamodels in current project to a file with date and time in the name to the downloads folder
  function handleSaveAllToFileDate() {
    const projectname = props.ph.phData.metis.name
    if (debug) console.log('37 LoadFile', data);

    // SaveAllToFileDate(data, projectname, 'Project')
    SaveAllToFileDate(data, projectname, '_PR')
  }

  // Save current model, metamodel, modelview, container to a file to the downloads folder
  // Attatch the metamodel to the model or modelview
  function handleSaveModelToFile() {
    const projectname = props.ph.phData.metis.name
    const curmodel = props.ph?.phData?.metis?.models?.find(m => m.id === props.ph?.phFocus?.focusModel?.id)
    const curmmodel = props.ph?.phData?.metis?.metamodels?.find(m => m.id === curmodel?.metamodelRef)
    const model = { metamodels: curmmodel, models: curmodel }
    SaveModelToFile(model, curmodel.name, "_MO")
  }
  function handleSaveModelviewToFile() {
    const projectname = props.ph.phData.metis.name
    const curmodel = props.ph?.phData?.metis?.models?.find(m => m.id === props.ph?.phFocus?.focusModel?.id)
    if (debug) console.log('73 LoadFile', curmodel)
    const focusModelviewIndex = curmodel.modelviews?.findIndex(m => m.id === props.ph?.phFocus?.focusModelview?.id)
    const curmodelview = curmodel.modelviews[focusModelviewIndex]
    const curmodelviewobjs = curmodel.objects.filter(obj => curmodelview.objectviews?.find(ov => ov.objectRef === obj.id))
    const curmodelviewrelships = curmodel.relships.filter(rel => curmodelview.relshipviews?.find(rv => rv.relshipRef === rel.id))
    const curmmodel = props.ph?.phData?.metis?.metamodels?.find(m => m.id === curmodel?.metamodelRef)
    const modelview = { metamodels: curmmodel, modelviews: curmodelview, objects: curmodelviewobjs, relships: curmodelviewrelships }
    SaveModelviewToFile(modelview, curmodel.name, "_MV")
  }

  // Save current metamodel to a file with date and time in the name to the downloads folder
  function handleSaveMetamodelToFile() {
    const model = props.ph?.phData?.metis?.models?.find(m => m.id === props.ph?.phFocus?.focusModel?.id)
    const metamodel = props.ph?.phData?.metis?.metamodels?.find(m => m.id === model?.metamodelRef)
    SaveMetamodelToFile(metamodel, metamodel.name, '_MM')
    // SaveModelToFile(metamodel, metamodel.name, 'AKMM-Metamodel')
  }

  function handleSaveNewModel() {
    const ph = props.ph
    // const models = ph?.phData?.metis?.models
    const metamodels = ph?.phData?.metis?.metamodels
    // const curmodel = models?.find(m => m.id === ph?.phFocus?.focusModel?.id)
    // const curmodelview = curmodel?.modelviews?.find(mv => mv.id === ph?.phFocus?.focusModelview?.id)
    // const curMetamodel = metamodels?.find(m => m.id === curmodel?.metamodelRef)
    const data = CreateNewModel(props.ph)//,  curmodel, curmodelview)
    if (debug) console.log('194 Loadfile', metamodels, data)
    if (!data) {
      if (debug) console.log('196 Loadfile', data)
      alert('No metamodel found in this modelview')
      return
    }
    const newmm = metamodels?.find(m => (m.name !== '_ADMIN_METAMODEL') && m.id === data.phData.metis.metamodels[0].id) // this is the new metamodel

    const filename = data.phData.metis.name

    if (debug) console.log('199 Loadfile', newmm, filename)
    SaveAllToFile(data, filename, '_PR')
    const metamodelname = newmm?.name.replace('_MM', '') // remove _MM to avoid twice
    SaveMetamodelToFile(newmm, metamodelname, '_MM')
  }

  // Save current model to a OSDU JSON file with date and time in the name to the downloads folder
  function handleSaveJSONToFile() {
    const projectname = props.ph.phData.metis.name
    const model = props.ph?.phData?.metis?.models?.find(m => m.id === props.ph?.phFocus?.focusModel?.id)
    const modelview = model.modelviews?.find(mv => mv && (mv.id === props.ph?.phFocus?.focusModelview?.id))
    WriteConvertModelToJSONFile(model, modelview, model.name, 'Json')
    // WriteConvertModelToJSONFile(model, model.name, 'AKMM-Model')
    // SaveModelToFile(model, projectname+'.'+model.name, 'AKMM-Model')
  }

  const { buttonLabel, className } = props;
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  // const buttonrefresh = <button className="btn-context btn-primary float-right mb-0 pr-2" color="link" onClick={toggle}>{buttonLabel}</button>

  const buttonSaveAllToFileDiv =
    <div>
      <button
        className="btn-secondary border rounded border-secondary mr-2 mb-3  w-100 "
        data-toggle="tooltip" data-placement="top" data-bs-html="true"
        title="Click to save current Project&#013;(all models and metamodels) to file &#013;(in Downloads folder)"
        onClick={handleSaveAllToFile}>Save Project to File: ..._ALL.json
      </button >
    </div>
  const buttonSaveAllToFileDateDiv =
    <div>
      <button
        className="btn-secondary border rounded border-secondary mr-2 mb-3  w-100  "
        data-toggle="tooltip" data-placement="top" data-bs-html="true"
        title="Click to save current Project &#013;(all models and metamodels) to file &#013;(in Downloads folder. The date is added to the filename)"
        onClick={handleSaveAllToFileDate}>Save Project to File: ..._date_ALL.json
      </button >
    </div>

  const buttonSaveModelToFileDiv =
    <div>
      <button className="btn-secondary border rounded border-secondary mr-2  w-100  "
        data-toggle="tooltip" data-placement="top" data-bs-html="true"
        title="Click to save current model to file&#013;(in Downloads folder)"
        onClick={handleSaveModelToFile}>Save Current Model to File: ..._MO.json (Metamodel included)
      </button >
    </div>

  const buttonSaveModelviewToFileDiv =
    <div>
      <button className="btn-secondary border rounded border-secondary mr-2  w-100  "
        data-toggle="tooltip" data-placement="top" data-bs-html="true"
        title="Click to save current modelview to file&#013;(in Downloads folder)"
        onClick={handleSaveModelviewToFile}>Save Current Modelview to File: ..._MV.json (Metamodel & Objects included)
      </button >
    </div>

  const buttonSaveMetamodelToFileDiv =
    <div>
      <button
        className="btn-secondary border rounded border-secondary mr-2  w-100  "
        data-toggle="tooltip" data-placement="top" data-bs-html="true"
        title="Click to save current Metamodel to file&#013;(in Downloads folder)&#013;The current Metamoel is the Metamodel of the current Model."
        onClick={handleSaveMetamodelToFile}>Save Current Metamodel to File: ..._MM.json
      </button >
    </div>

  // const buttonSaveMetamodelWithSubToFileDiv =
  //   <div>
  //     <button
  //       className="btn-secondary border rounded border-secondary mr-2  w-100  "
  //       data-toggle="tooltip" data-placement="top" data-bs-html="true"
  //       title="Click to save current Metamodel to file&#013;(in Downloads folder)&#013;The current Metamoel is the Metamodel of the current Model."
  //       onClick={handleSaveMetamodelWithSubToProjectfile}>Create New Startfile from this Modelviews Metamodelobject to: New-Project_PR.json
  //     </button >
  //   </div>

  const buttonSaveModelprojectToFileDiv =
    <div>
      <button
        className="btn-secondary border rounded border-secondary mr-2  w-100  "
        data-toggle="tooltip" data-placement="top" data-bs-html="true"
        title="Click to save create a new startmodel project based on the generated metamodel from this modelview"
        onClick={handleSaveNewModel}>Create files: "New-Project"_PR.json and "New-Metamodel"_MM.json
      </button >
    </div>

  if (debug) console.log('172', buttonLabel);

  return (
    <>
      <span><button className="btn bg-secondary text-white py-1 pe-1" onClick={toggle}>File <i className="fa fa-file-import fa-lg  me-1 "></i><i className="fa fa-file-export fa-lg me-1 ms-1 "></i></button></span>
      <Modal isOpen={modal} toggle={toggle} className={className} >
        <ModalHeader toggle={() => { toggle(); toggleRefresh() }}>Export/Import: </ModalHeader>
        <ModalBody className="pt-0 d-flex flex-column">
          <span> Current Source : <strong> {props.ph.phSource} </strong></span>
          {/* <div className="source bg-light p-2 "> Models: <strong> {modelNames}</strong></div>
          <div className="source bg-light p-2 "> Metamodels: <strong> {metamodelNames}</strong></div> */}
          <div className="source bg-light p-2 ">
            <hr style={{ borderTop: "1px solid #8c8b8", backgroundColor: "#9cf", padding: "2px", margin: "1px", marginBottom: "1px" }} />
            <div className="loadsave px-2 pb-1 mb-0">
              <div className="loadsave--modelToFile select mb-1 p-2 border border-dark">
                {/* <hr style={{ borderTop: "4px solid #8c8b8", backgroundColor: "#9cf", padding: "2px",  marginTop: "3px" , marginBottom: "3px" }} /> */}
                <h5>Model</h5>
                <div className="selectbox mb-2 border">
                  <h6>Import from file (will overwrite current) </h6>
                  <input className="select-input " title="Choose a file" type="file" accept=".json" onChange={(e) => ReadModelFromFile(props.ph, dispatch, e)} placeholder="Choose a file" />
                </div>
                <div className="selectbox mb-2 border">
                  <h6>Export Models to file </h6>
                  {buttonSaveAllToFileDiv}
                  {buttonSaveAllToFileDateDiv}
                  {buttonSaveModelToFileDiv}
                  {buttonSaveModelviewToFileDiv}
                  {/* {buttonSaveModelWMMToFileDiv} */}
                </div>
                {/* <h6>Send Project by mail </h6>
                  <div className="selectbox bg-white mb-2 border">
                    <div className="ml-2">{emailDivGmail}</div>
                    <div className="ml-2">{emailDivMailto}</div>
                  </div> 
                */}
              </div>
              <div className="loadsave--metamodelToFile select mb-1 p-2 border border-dark">
                {/* <hr style={{ borderTop: "4px solid #8c8b8", backgroundColor: "#9cf", padding: "2px",  marginTop: "3px" , marginBottom: "3px" }} /> */}
                <h5>Metamodel </h5>
                <div className="selectbox mb-2 border">
                  <h6>Import from file (will overwrite current)</h6>
                  <input className="select-input" title="Select a file" type="file" accept=".json" onChange={(e) => ReadMetamodelFromFile(props.ph, dispatch, e)} />
                </div>
                <div className="selectbox mb-2 border">
                  <h6>Export Metamodel to file </h6>
                  {buttonSaveMetamodelToFileDiv}
                </div>
                {/* <div className="selectbox mb-2 border">
                  <h6>Export start project with Metamodel, sub-metamodels and sub-models to file </h6>
                  {buttonSaveMetamodelWithSubToFileDiv}
                </div> */}
                <div className="selectbox mb-2 border">
                  <h6>Export New Startmodel-file and Metamodel-file from this modelview</h6>
                  {buttonSaveModelprojectToFileDiv}
                </div>
              </div>
            </div>
          </div>

        </ModalBody>
        {/* <div className="ml-2">{emailDivMailto}</div> */}
        <ModalFooter>
          <Button className="modal--footer m-0 py-1 px-2" color="primary" data-toggle="tooltip" data-placement="top" data-bs-html="true"
            title="Click when done!" onClick={() => { toggle(); toggleRefresh() }}>Done
          </Button>
        </ModalFooter>
      </Modal>
      <style jsx>{`
            `}</style>
    </>
  )

}

export default LoadFile

