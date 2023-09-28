import React, { useState, useContext } from "react"
import ProgressBar from "react-bootstrap/ProgressBar"
import useInterval from "@khalidalansi/use-interval"
import { requestJson } from "../../utilities/requests"
import { WorkspaceContext } from "../workspace/workspaceContext"
import { PageInfosContext } from "../mainPages/moduleBasics/pageInfosContext"

const ProgressBarRequests = ({ isUpdating, setIsUpdating }) => {
  // const [isUpdating, setIsUpdating] = useState(true);
  const { pageId } = useContext(PageInfosContext) // used to get the flow infos
  const [progress, setProgress] = useState({
    now: 0,
    currentName: ""
  })
  const { port } = useContext(WorkspaceContext) // used to get the port

  useInterval(
    () => {
      requestJson(
        port,
        "/learning/progress",
        // eslint-disable-next-line camelcase
        { scene_id: pageId },
        (data) => {
          setProgress({
            now: data.progress,
            currentName: data.cur_node
          })
          if (data.progress === 100) {
            setIsUpdating(false)
            setProgress({
              now: data.progress,
              currentName: "Done!"
            })
          }
        },
        (error) => {
          setIsUpdating(false)
        }
      )
    },
    isUpdating ? 200 : null
  )

  return (
    <>
      <label>{progress.currentName || ""}</label>
      <ProgressBar
        variant="success"
        animated
        now={progress.now}
        label={`${progress.now}%`}
      />
    </>
  )
}

export default ProgressBarRequests
