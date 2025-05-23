// ts-nocheck

import React from 'react';
const debug = false;

interface MdFocusObjectProps {
  title: string;
  curRelatedObjsRels: any[];
  curmodelview: any;
  curmetamodel: any;
  selectedId: string;
  setSelectedId: (id: string) => void;
  curobject: any;
  objects: any[];
  includedKeys: string[];
  setObjview: (objview: any) => void;
  markdownString: string;
}

const ObjDetailToMarkdown = ({
  title,
  curRelatedObjsRels,
  curmodelview,
  curmetamodel,
  selectedId,
  setSelectedId,
  curobject,
  objects,
  includedKeys,
  setObjview,
  markdownString,
}: MdFocusObjectProps) => {
  console.log('29 curRelatedObjsRels', curRelatedObjsRels);
  // markdownString += `### ${title}\n\n`;
  markdownString += Array.isArray(curRelatedObjsRels)
    ? curRelatedObjsRels.map((objrel) => {
      const properties = Object.keys(objrel)
        .filter((pv) => includedKeys.includes(pv))
        .map((pv) => `${pv}: ${objrel[pv]}`)
        .join('\n\n');
      const objectType = curmetamodel.objecttypes.find((ot: any) => ot.id === objrel.typeRef)?.name;
      return `## Object: ${objrel.name} (${objectType} )\n\n${properties}\n\n --- \n\n`;
      // return `1. ${objrel.name} \n\n${properties} \n\n2. Object: ${objrel.name} (${objectType} )\n\n --- \n\n`;
    })
      .join('')
    : '';
  markdownString += Array.isArray(objects)
    ? objects.map((objrel) => {
      const properties = Object.keys(objrel)
        .filter((pv) => includedKeys.includes(pv))
        .map((pv) => `${pv}: ${objrel[pv]}`)
        .join('\n\n');
      const objectType = curmetamodel.objecttypes.find((ot: any) => ot.id === objrel.typeRef)?.name;
      return `## Object: ${objrel.name} (${objectType} )\n\n${properties}\n\n --- \n\n`;
      // return `1. ${objrel.name} \n\n${properties} \n\n2. Object: ${objrel.name} (${objectType} )\n\n --- \n\n`;
    })
      .join('')
    : '';
  if (debug) console.log('43 markdownString', markdownString);
  return markdownString;
};

export default ObjDetailToMarkdown;