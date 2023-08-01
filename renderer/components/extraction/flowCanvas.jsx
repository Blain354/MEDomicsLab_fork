import React, { useState, useCallback, useMemo, useEffect, use } from "react"
import { toast } from "react-toastify"
import EditableLabel from "react-simple-editlabel"
import TreeMenu from "react-simple-tree-menu"

// Import utilities
import { loadJsonSync, downloadJson } from "../../utilities/fileManagementUtils"
import { axiosPostJson } from "../../utilities/requests"

// Workflow imports
import { useNodesState, useEdgesState, useReactFlow, addEdge } from "reactflow"
import WorkflowBase from "../flow/workflowBase"

// Import node types
import StandardNode from "./nodesTypes/standardNode"
import SegmentationNode from "./nodesTypes/segmentationNode"
import FilterNode from "./nodesTypes/filterNode"
import FeaturesNode from "./nodesTypes/featuresNode"
import ExtractionNode from "./nodesTypes/extractionNode"

// Import node parameters
import nodesParams from "../../public/setupVariables/allNodesParams"

// Import buttons
import ResultsButton from "./buttonsTypes/resultsButton"
import BtnDiv from "../flow/btnDiv"

// Static functions used in the workflow
import { removeDuplicates, deepCopy } from "../../utilities/staticFunctions"

// Static nodes parameters
const staticNodesParams = nodesParams

/**
 *
 * @param {String} id id of the workflow for multiple workflows management
 * @param {function} changeSidebarType function to change the sidebar type
 * @param {String} workflowType type of the workflow (extraction or features)
 * @returns {JSX.Element} A workflow component as defined in /flow
 *
 * @description
 * Component used to display the workflow of the extraction tab of MEDomicsLab.
 *
 */
const Workflow = ({ workflowType, setWorkflowType }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]) // nodes array, setNodes is used to update the nodes array, onNodesChange is a callback hook that is executed when the nodes array is changed
  const [edges, setEdges, onEdgesChange] = useEdgesState([]) // edges array, setEdges is used to update the edges array, onEdgesChange is a callback hook that is executed when the edges array is changed
  const [reactFlowInstance, setReactFlowInstance] = useState(null) // reactFlowInstance is used to get the reactFlowInstance object important for the reactFlow library
  const [nodeUpdate, setNodeUpdate] = useState({}) // nodeUpdate is used to update a node internal data
  const { setViewport } = useReactFlow() // setViewport is used to update the viewport of the workflow
  const [treeData, setTreeData] = useState({}) // treeData is used to set the data of the tree menu
  const [groupNodeId, setGroupNodeId] = useState(null) // groupNodeId is used to know which groupNode is selected
  const [results, setResults] = useState({}) // results is used to store radiomic features results

  // Executed when edges change
  useEffect(() => {
    console.log("The use effect is executed")
    // Check if there are any connections between an input and segmentation node
    const inputSegmentationConnections = edges.filter(
      (edge) =>
        (nodes.find((node) => node.id === edge.source).data.internal.type ===
          "input" &&
          nodes.find((node) => node.id === edge.target).data.internal.type ===
            "segmentation") ||
        (nodes.find((node) => node.id === edge.source).data.internal.type ===
          "segmentation" &&
          nodes.find((node) => node.id === edge.target).data.internal.type ===
            "inputNode")
    )

    // Update the segmentation node's data with the ROIs from the input node
    inputSegmentationConnections.forEach((connection) => {
      const inputNodeId = nodes.find((node) => node.id === connection.source).id
      const segmentationNodeId = nodes.find(
        (node) => node.id === connection.target
      ).id

      const inputNode = nodes.find((node) => node.id === inputNodeId)
      const segmentationNode = nodes.find(
        (node) => node.id === segmentationNodeId
      )

      const inputROIs = inputNode.data.internal.settings.rois
      segmentationNode.data.internal.settings.rois = inputROIs

      // Update the segmentation node
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === segmentationNodeId) {
            return segmentationNode
          }
          return node
        })
      )
    })

    // Remove ROIs from segmentation nodes that are not connected to an input node
    nodes.forEach((node) => {
      if (
        node.data.internal.type === "segmentation" &&
        !inputSegmentationConnections.some(
          (connection) => connection.target === node.id
        )
      ) {
        node.data.internal.settings.rois = {}
        setNodes((prevNodes) =>
          prevNodes.map((n) => {
            if (n.id === node.id) {
              return node
            }
            return n
          })
        )
      }
    })
  }, [edges])

  // Declare node types using useMemo hook to avoid re-creating component types unnecessarily (it memorizes the output)
  // https://www.w3schools.com/react/react_usememo.asp
  const nodeTypes = useMemo(
    () => ({
      segmentationNode: SegmentationNode,
      standardNode: StandardNode,
      filterNode: FilterNode,
      featuresNode: FeaturesNode,
      extractionNode: ExtractionNode
    }),
    []
  )

  // Execute setTreeData when there is a change in nodes or edges arrays.
  useEffect(() => {
    setTreeData(createTreeFromNodes())
  }, [nodes, edges])

  // Executed when groupNodeId changes. I put it in useEffect because it assures groupNodeId is updated.
  useEffect(() => {
    // If there is a groupNodeId, the workflow is a features workflow
    if (groupNodeId) {
      // Set the workflow type to features
      setWorkflowType("features")
      // Hide the nodes that are not in the features group
      hideNodesbut(groupNodeId)
    } else {
      // Else the workflow is an extraction workflow
      setWorkflowType("extraction")
      // Hide the nodes that are not in the extraction group
      hideNodesbut(groupNodeId)
    }
  }, [groupNodeId])

  /**
   *
   * @param {String} activeNodeId id of the group that is active
   *
   * This function hides the nodes and edges that are not in the active group
   * each node has a subflowId that is the id of the group it belongs to
   * if the subflowId is not equal to the activeNodeId, then the node is hidden
   *
   */
  const hideNodesbut = (activeNodeId) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        node = {
          ...node
        }
        node.hidden = node.data.internal.subflowId != activeNodeId
        return node
      })
    )

    setEdges((edges) =>
      edges.map((edge) => {
        edge = {
          ...edge
        }
        edge.hidden =
          nodes.find((node) => node.id === edge.source).data.internal
            .subflowId != activeNodeId ||
          nodes.find((node) => node.id === edge.target).data.internal
            .subflowId != activeNodeId
        return edge
      })
    )
  }

  /**
   * @returns {Object} updated tree data
   *
   * This function creates the tree data from the nodes array
   * it is used to create the recursive workflow
   */
  const createTreeFromNodes = useCallback(() => {
    // recursively create tree from nodes
    const createTreeFromNodesRec = (node) => {
      let children = {}
      edges.forEach((edge) => {
        if (edge.source == node.id) {
          let targetNode = JSON.parse(
            JSON.stringify(nodes.find((node) => node.id === edge.target))
          )
          if (targetNode.type != "extractionNode") {
            let subIdText = ""
            let subflowId = targetNode.data.internal.subflowId
            if (subflowId) {
              subIdText =
                JSON.parse(
                  JSON.stringify(nodes.find((node) => node.id == subflowId))
                ).data.internal.name + "."
            }
            children[targetNode.id] = {
              label: subIdText + targetNode.data.internal.name,
              nodes: createTreeFromNodesRec(targetNode)
            }
          }
        }
      })
      return children
    }

    let treeMenuData = {}
    edges.forEach((edge) => {
      let sourceNode = JSON.parse(
        JSON.stringify(nodes.find((node) => node.id === edge.source))
      )

      if (sourceNode.data.internal.type === "input") {
        treeMenuData[sourceNode.id] = {
          label: sourceNode.data.internal.name,
          nodes: createTreeFromNodesRec(sourceNode)
        }
      }
    })

    return treeMenuData
  }, [nodes, edges])

  /**
   * @param {Object} newNode base node object
   * @param {String} associatedNode id of the parent node if the node is a sub-group node
   * @returns
   *
   * Function passed to workflowBase to add the specific properties of a
   * node in the workflow for extraction or features
   */
  const addSpecificToNode = (newNode, associatedNode) => {
    newNode.id = `${newNode.id}${associatedNode ? `.${associatedNode}` : ""}`

    // Add defaut parameters of node to possibleSettings
    let type = newNode.data.internal.type
      .replaceAll(/ |-/g, "_")
      .replace(/[^a-z_]/g, "")

    let setupParams = {}
    if (staticNodesParams[workflowType][type]) {
      setupParams = JSON.parse(
        JSON.stringify(staticNodesParams[workflowType][type])
      )
    }

    // Add default parameters to node data
    newNode.data.setupParam = setupParams

    // Initialize settings in node data to put the parameters selected by the user
    let featuresNodeDefaultSettings = { features: ["extract_all"] }
    newNode.data.internal.settings =
      newNode.type === "featuresNode"
        ? featuresNodeDefaultSettings
        : newNode.data.setupParam.possibleSettings.defaultSettings

    newNode.data.parentFct.changeSubFlow = setGroupNodeId

    newNode.data.internal.subflowId = !associatedNode
      ? groupNodeId
      : associatedNode

    // Used to enable the view button of a node (if it exists)
    newNode.data.internal.enableView = false

    // Add dictionnary to put results in node data if the node is an extractionNode
    if (newNode.type === "extractionNode") {
      newNode.data.internal.results = {}
    }

    return newNode
  }

  /**
   * @param {Object} id id of the node to delete
   *
   * This function is called when the user clicks on the delete button of a node
   * it deletes the node and its edges. If the node is a group node, it deletes
   * all the nodes inside the group node
   */
  const deleteNode = useCallback(
    (id) => {
      console.log("delete node", id)
      setNodes((nds) =>
        nds.reduce((filteredNodes, n) => {
          if (n.id !== id) {
            filteredNodes.push(n)
          }
          if (n.type == "extractionNode") {
            let childrenNodes = nds.filter(
              (node) => node.data.internal.subflowId == id
            )
            childrenNodes.forEach((node) => {
              deleteNode(node.id)
            })
          }
          return filteredNodes
        }, [])
      )
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id))
    },
    [nodes]
  )

  // Temporary fix used to simulate the call to the backend that is not yet refactored
  // Will be removed when the backed is finished
  // TODO : Did not do the special case for extraction node!
  const transformFlowInstance = useCallback(() => {
    // Initialize the new dictionnary for the modified flow
    let modifiedFlow = {
      drawflow: {
        Home: {
          data: {}
        }
      }
    }

    if (reactFlowInstance) {
      let flow = JSON.parse(JSON.stringify(reactFlowInstance.toObject()))
      console.log("The current React Flow instance is : ")
      console.log(flow)

      flow.nodes.forEach((node) => {
        const nodeID = node.id

        // If the node is a features node
        if (node.type === "featuresNode") {
          // If the node is a featuresNode, it has a subflowId and its module name is extraction-subFlowId
          let moduleName = "extraction-" + node.data.internal.subflowId
          // If the subFlowId structure is not already created, create it
          if (!(moduleName in modifiedFlow.drawflow)) {
            modifiedFlow.drawflow[moduleName] = {
              data: {}
            }
          }

          // Add the node data to the subFlowId structure
          modifiedFlow.drawflow[moduleName].data[nodeID] = {
            id: nodeID,
            name: node.data.setupParam.possibleSettings.defaultSettings
              .MEDimageName,
            data: node.data.internal.settings,
            class: node.className,
            inputs: {},
            outputs: {}
          }
        } else {
          modifiedFlow.drawflow.Home.data[nodeID] = {
            id: nodeID,
            name: node.data.internal.type.replaceAll(/ |-/g, "_"),
            data: node.data.internal.settings
              ? node.data.internal.settings
              : {},
            class: node.className,
            inputs: {},
            outputs: {}
          }
        }
      })

      // Note : only the nodes in home module can be connected, therefore it is not necessary to check
      // if the edges to be in the structure other than Home in the dictionnary
      flow.edges.forEach((edge) => {
        const sourceNode = flow.nodes.find((node) => node.id === edge.source)
        const targetNode = flow.nodes.find((node) => node.id === edge.target)

        const sourceNodeID = sourceNode.id
        const targetNodeID = targetNode.id

        const outputKey = "output_1"
        const inputKey = "input_1"

        if (!modifiedFlow.drawflow.Home.data[sourceNodeID].outputs[outputKey]) {
          modifiedFlow.drawflow.Home.data[sourceNodeID].outputs[outputKey] = {
            connections: [{ node: targetNodeID, input: inputKey }]
          }
        } else {
          modifiedFlow.drawflow.Home.data[sourceNodeID].outputs[
            outputKey
          ].connections.push({ node: targetNodeID, input: inputKey })
        }

        if (!modifiedFlow.drawflow.Home.data[targetNodeID].inputs[inputKey]) {
          modifiedFlow.drawflow.Home.data[targetNodeID].inputs[inputKey] = {
            connections: [{ node: sourceNodeID, output: outputKey }]
          }
        } else {
          modifiedFlow.drawflow.Home.data[targetNodeID].inputs[
            inputKey
          ].connections.push({ node: sourceNodeID, output: outputKey })
        }
      })

      return modifiedFlow
    }
    return null
  }, [reactFlowInstance])

  // TODO Function that would check every node has the necessary data and that the pipelines are functionnal before running a node or a workflow.
  const preRunCheck = useCallback(() => {}, [reactFlowInstance])

  // Handles merge between the already existing data of an extraction node and the response dictionnary from the backend
  // TODO : Should not have to be used after refactoring of backend
  const handleExtractionResults = (oldNodeData, response) => {
    // Get the results that were in the node
    let oldResults = oldNodeData
    let newResults = oldResults
    if (Object.keys(oldResults).length === 0) {
      // If there is no results yet in this node (first run), create a new dictionnary
      for (let file in response) {
        newResults[file] = { RUN_1: {} }
        let pipelineNumber = 1
        for (let pip in response[file]) {
          let newPipelineName = "pipeline " + pipelineNumber
          newResults[file]["RUN_1"][newPipelineName] = response[file][pip]
          newResults[file]["RUN_1"][newPipelineName]["settings"][
            "fullPipelineName"
          ] = { pip }
          pipelineNumber++
        }
      }
    } else {
      for (let file in response) {
        // Check if the file is alreay in the results
        if (file in oldResults) {
          // Add the new results to the dictionnary
          let runNumber = Object.keys(oldResults[file]).length + 1
          newResults[file]["RUN_" + runNumber] = {}
          let pipelineNumber = 1
          for (let pip in response[file]) {
            let newPipelineName = "pipeline " + pipelineNumber
            newResults[file]["RUN_" + runNumber][newPipelineName] =
              response[file][pip]
            newResults[file]["RUN_" + runNumber][newPipelineName]["settings"][
              "fullPipelineName"
            ] = { pip }
            pipelineNumber++
          }
        } else {
          // Create a new dictionnary for the file
          newResults[file] = { RUN_1: {} }
          let pipelineNumber = 1
          for (let pip in response[file]) {
            let newPipelineName = "pipeline " + pipelineNumber
            newResults[file]["RUN_1"][newPipelineName] = response[file][pip]
            newResults[file]["RUN_1"][newPipelineName]["settings"][
              "fullPipelineName"
            ] = { pip }
            pipelineNumber++
          }
        }
      }
    }
    return newResults
  }

  function mergeWithoutDuplicates(list1, list2) {
    // Create a new Set by combining both lists
    const mergedSet = new Set([...list1, ...list2])

    // Convert the Set back to an array
    const mergedArray = Array.from(mergedSet)

    return mergedArray
  }

  /**
   *
   * @param {String} id id of the node to execute
   *
   * This function is called when the user clicks on the run button of a node
   * It executes the pipelines finishing with this node
   */
  const runNode = useCallback(
    (id) => {
      console.log("Running node", id)

      // Transform the flow instance to a dictionary compatible with the backend
      let newFlow = transformFlowInstance()
      console.log("Flow dictionary sent to backend is : ")
      console.log(newFlow)

      // Get the node from id
      let nodeName = newFlow.drawflow.Home.data[id]
        ? newFlow.drawflow.Home.data[id].name
        : "extraction"

      // POST request to /extraction/run for the current node by sending form_data
      var formData = JSON.stringify({
        id: id,
        name: nodeName,
        json_scene: newFlow
      })

      axiosPostJson(formData, "extraction/run")
        .then((response) => {
          toast.success("Node executed successfully")
          console.log("Response from backend is: ")
          console.log(response)

          // Get all the nodes in the executed pipeline
          let executedNodes = []
          for (let files in response) {
            for (let pipeline in response[files]) {
              let pipelineNodeIds = pipeline.match(/node_[a-f0-9-]+/g)
              executedNodes = mergeWithoutDuplicates(
                executedNodes,
                pipelineNodeIds
              )
            }
          }

          // Update the extractionNode data with the response from the backend
          // And enable the view button of the nodes
          setNodes((prevNodes) =>
            prevNodes.map((node) => {
              if (node.id === id && node.type === "extractionNode") {
                // Get the results that were in the node
                let oldResults = node.data.internal.results
                let newResults = handleExtractionResults(oldResults, response)

                return {
                  ...node,
                  data: {
                    ...node.data,
                    internal: {
                      ...node.data.internal,
                      results: newResults // Update the results data with the response
                    }
                  }
                }
              }

              if (executedNodes.includes(node.id)) {
                // Enable the view button of the node
                node.data.internal.enableView = true
                node.data.parentFct.updateNode({
                  id: node.id,
                  updatedData: node.data.internal
                })
              }

              return node
            })
          )
        })
        .catch((error) => {
          // Warn the user if the node could not be executed correctly
          console.log(error)
          toast.warn("Could not run the node.")
        })
    },
    [nodes, edges, reactFlowInstance]
  )

  /**
   * Runs all the pipelines in the workflow
   */
  const onRun = useCallback(() => {
    console.log("Running workflow")

    // Transform the flow instance to a dictionnary compatible with the backend
    let newFlow = transformFlowInstance()
    console.log("Flow dictionnary sent to back end is : ")
    console.log(newFlow)

    // Post request to extraction/run-all for current workflow
    axiosPostJson(newFlow, "extraction/run-all")
      .then((response) => {
        console.log("Response from the backend : ")
        console.log(response)
        toast.success("Workflow executed successfully")

        // A response from the backend is only given if there are e

        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            // If the type of the node is extractionNode, update the results according
            // to the response from the backend
            if (node.type === "extractionNode") {
              // Get the results that were in the node
              let oldResults = node.data.internal.results
              let newResults = handleExtractionResults(oldResults, response)

              return {
                ...node,
                data: {
                  ...node.data,
                  internal: {
                    ...node.data.internal,
                    results: newResults // Update the results data with the response
                  }
                }
              }
            }

            // Enable the view button of the node
            node.data.internal.enableView = true
            node.data.parentFct.updateNode({
              id: node.id,
              updatedData: node.data.internal
            })

            return node
          })
        )
      })
      .catch((error) => {
        // Warn the user if the workflow could not be executed correctly
        toast.warn("Could not run the workflow.")
      })
  }, [nodes, edges, reactFlowInstance])

  /**
   * Clear the canvas if the user confirms
   */
  const onClear = useCallback(() => {
    console.log(reactFlowInstance.toObject())
    if (reactFlowInstance & (nodes.length > 0)) {
      let confirmation = confirm(
        "Are you sure you want to clear the canvas?\nEvery data will be lost."
      )
      if (confirmation) {
        setNodes([])
        setEdges([])
      }
    } else {
      toast.warn("No workflow to clear")
    }
  }, [reactFlowInstance, nodes])

  /**
   * Save the workflow as a json file
   */
  const onSave = useCallback(() => {
    if (reactFlowInstance && nodes.length > 0) {
      const flow = JSON.parse(JSON.stringify(reactFlowInstance.toObject()))
      flow.nodes.forEach((node) => {
        node.data.parentFct = null
        node.data.setupParam = null
        // Set enableView to false because only the scene is saved
        // and importing it back would not reload the volumes that
        // were loaded in the viewer
        node.data.enableView = false
      })
      console.log("flow", flow)
      downloadJson(flow, "experiment")
    } else {
      toast.warn("No workflow to save!")
    }
  }, [reactFlowInstance, nodes])

  /**
   * Load a workflow from a json file
   */
  const onLoad = useCallback(() => {
    // Ask confirmation from the user if the canvas is not empty,
    // since the workflow will be replaced
    let confirmation = true
    if (nodes.length > 0) {
      confirmation = confirm(
        "Are you sure you want to import a new experiment?\nEvery data will be lost."
      )
    }
    if (confirmation) {
      // If the user confirms, load the json file
      const restoreFlow = async () => {
        try {
          // Ask user for the json file to open
          const flow = await loadJsonSync() // wait for the json file to be loaded (see /utilities/fileManagementUtils.js)
          console.log("loaded flow", flow)

          // TODO : should have conditions regarding json file used for import!
          // For each nodes in the json file, add the specific parameters
          Object.values(flow.nodes).forEach((node) => {
            // the line below is important because functions are not serializable
            // reset functions associated with nodes
            node.data.parentFct = {
              deleteNode: deleteNode,
              updateNode: setNodeUpdate,
              runNode: runNode,
              changeSubFlow: setGroupNodeId
            }
            // set workflow type
            let subworkflowType = node.data.internal.subflowId
              ? "extraction"
              : "features"
            // set node type
            let setupParams = deepCopy(
              staticNodesParams[subworkflowType][
                node.name.toLowerCase().replaceAll(" ", "_")
              ]
            )
            node.data.setupParam = setupParams
          })

          if (flow) {
            const { x = 0, y = 0, zoom = 1 } = flow.viewport
            setNodes(flow.nodes || [])
            setEdges(flow.edges || [])
            setViewport({ x, y, zoom })
          }
        } catch (error) {
          toast.warn("Error loading file : ", error)
        }
      }

      // Call the async function
      restoreFlow()
    }
  }, [setNodes, setViewport, nodes])

  /**
   * Set the subflow id to null to go back to the main workflow
   */
  const onBack = useCallback(() => {
    setGroupNodeId(null)
  }, [])

  /**
   * @param {Object} info info about the node clicked
   *
   * This function is called when the user clicks on a tree item
   *
   */
  const onTreeItemClick = (info) => {
    console.log("tree item clicked: ", info)
  }

  // TODO : take out of mandatory in flow/workflowBase.js
  const onNodeDrag = useCallback(
    (event, node) => {
      // TODO
    },
    [nodes]
  )

  const isGoodConnection = (connection) => {
    // Getting the source and target nodes
    let sourceNode = nodes.find((node) => node.id == connection.source)
    let targetNode = nodes.find((node) => node.id == connection.target)
    let sourceNodeType = sourceNode.data.internal.type
    let targetNodeType = targetNode.data.internal.type

    // If the connection is between an input and a segmentation node
    if (
      (sourceNodeType == "input" && targetNodeType == "segmentation") ||
      (sourceNodeType == "segmentation" && targetNodeType == "input")
    ) {
      // If the segmentation node already has an input, a connection to a new input is not allowed
      if (edges.find((edge) => edge.target == targetNode.id)) {
        return false
      }
    }

    return true
  }

  return (
    <>
      <WorkflowBase
        // mandatory props
        mandatoryProps={{
          reactFlowInstance: reactFlowInstance,
          setReactFlowInstance: setReactFlowInstance,
          addSpecificToNode: addSpecificToNode,
          nodeTypes: nodeTypes,
          nodes: nodes,
          setNodes: setNodes,
          onNodesChange: onNodesChange,
          edges: edges,
          setEdges: setEdges,
          onEdgesChange: onEdgesChange,
          onNodeDrag: onNodeDrag,
          runNode: runNode,
          nodeUpdate: nodeUpdate,
          setNodeUpdate: setNodeUpdate
        }}
        // optional props
        onDeleteNode={deleteNode}
        isGoodConnection={isGoodConnection}
        // represents the visual over the workflow
        ui={
          <>
            <div className="btn-panel-top-corner-left">
              {workflowType == "extraction" && (
                <>
                  <TreeMenu
                    data={treeData}
                    onClickItem={onTreeItemClick}
                    debounceTime={125}
                    hasSearch={false}
                  />
                </>
              )}
            </div>
            <div className="btn-panel-top-corner-right">
              {workflowType == "extraction" ? (
                <BtnDiv
                  buttonsList={[
                    { type: "run", onClick: onRun },
                    { type: "clear", onClick: onClear },
                    { type: "save", onClick: onSave },
                    { type: "load", onClick: onLoad }
                  ]}
                />
              ) : (
                <BtnDiv buttonsList={[{ type: "back", onClick: onBack }]} />
              )}
            </div>
          </>
        }
      />
    </>
  )
}

export default Workflow
