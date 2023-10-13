import React from "react"
import DatasetSelector from "./dataComponents/datasetSelector"
import ModulePage from "./moduleBasics/modulePage"
import { Accordion, AccordionTab } from "primereact/accordion"
/**
 * @description - This component is the input page of the application
 * @returns the input page component
 */
const InputPage = ({ pageId = "42", configPath = null }) => {
  // eslint-disable-next-line no-unused-vars
  const [data, setData] = React.useState([])
  const [activeIndex, setActiveIndex] = React.useState([0, 2])
  return (
    <>
      <ModulePage pageId={pageId} configPath={configPath}>
        <h1>INPUT MODULE</h1>
        <Accordion multiple activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <AccordionTab header="Dataset Selector">
            <DatasetSelector multiSelect={true} />
          </AccordionTab>
          <AccordionTab header="Merge Tool">
            <h1>Merge Tool</h1>
          </AccordionTab>
        </Accordion>
      </ModulePage>
    </>
  )
}

export default InputPage
