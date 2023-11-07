import { ipcRenderer } from "electron"
import axios from "axios"
import { toast } from "react-toastify"
import MEDconfig, { SERVER_CHOICE } from "../../medomics.dev"

/**
 *
 * @param {int} port server port
 * @param {string} topic route to send the request to
 * @param {Object} json2send json to send
 * @param {Function} jsonReceivedCB executed when the json is received
 * @param {Function} onError executed when an error occurs
 */
export const requestBackend = (port, topic, json2send, jsonReceivedCB, onError) => {
  if (MEDconfig.serverChoice == SERVER_CHOICE.GO) {
    axiosPostJsonGo(port, topic, json2send, jsonReceivedCB, onError)
  } else if (MEDconfig.serverChoice == SERVER_CHOICE.FLASK) {
    requestJson(port, topic, json2send, jsonReceivedCB, onError)
  }
}

/**
 *
 * @param {int} port server port
 * @param {string} topic route to send the request to
 * @param {string} pageId id of the page where the request is send from (optional)
 * @param {Object} json2send json to send
 * @param {Function} jsonReceivedCB executed when the json is received
 * @param {Function} onError executed when an error occurs
 */
export const requestJson = (port, topic, json2send, jsonReceivedCB, onError) => {
  topic[0] == "/" && (topic = topic.substring(1))
  try {
    ipcRenderer
      .invoke("request", {
        data: {
          json2send
        },
        method: "POST",
        url: "http://localhost:" + port + (topic[0] != "/" ? "/" : "") + topic
      })
      .then((data) => {
        jsonReceivedCB(data["data"])
      })
      .catch((resp) => {
        console.log(resp)
        onError
          ? onError(resp)
          : () => {
              console.error("Error:", resp)
              toast.error("An error occured while using ipcRenderer.invoke")
            }
      })
  } catch (error) {
    console.error(error)
    toast.error("An error occured while using ipcRenderer.invoke")
    onError(error)
  }
}

/**
 *
 * @param {int} port server port
 * @param {string} topic route to send the request to
 * @param {string} pageId id of the page where the request is send from (optional)
 * @param {Object} json2send json to send
 * @param {Function} jsonReceivedCB executed when the json is received
 * @param {Function} onError executed when an error occurs
 */
export const axiosPostJsonGo = async (port, topic, json2send, jsonReceivedCB, onError) => {
  console.log("http://localhost:" + port + (topic[0] != "/" ? "/" : "") + topic)
  try {
    const response = await axios.post("http://localhost:" + port + (topic[0] != "/" ? "/" : "") + topic, { message: JSON.stringify(json2send) }, { headers: { "Content-Type": "application/json" } })
    if (response.data.type == "toParse") {
      let cleanResponse = {}
      try {
        cleanResponse = JSON.parse(response.data.response_message)
      } catch (error) {
        cleanResponse = JSON.parse(parsingCleaning(response.data.response_message))
      }
      jsonReceivedCB(cleanResponse)
    } else {
      jsonReceivedCB(response.data.response_message)
    }
    return response.data
  } catch (error) {
    onError
      ? onError(error)
      : () => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log("Server Error:", error.response.data)
            console.log("Status Code:", error.response.status)
            console.log("Headers:", error.response.headers)
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser
            console.log("Request Error:", error.request)
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error:", error.message)
          }
        }
  }
}

/**
 * @param {Object} jsonData json to send
 * @param {string} pathName route to send the request to
 * @returns
 */
export const axiosPostJson = async (jsonData, pathName) => {
  try {
    const response = await axios.post("http://localhost:5000/" + pathName, jsonData, { headers: { "Content-Type": "application/json" } })

    return response.data
  } catch (error) {
    console.error("ICIIIIIIIIIIIIIIIIII")
    console.error(error)
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Server Error:", error.response.data)
      console.error("Status Code:", error.response.status)
      console.error("Headers:", error.response.headers)
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser
      console.error("Request Error:", error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error.message)
    }
    throw error
  }
}

/**
 *
 * @param {String} response the response string to clean
 * @description trim the response string to only keep the json parsable part
 * @returns the cleaned response
 */
const parsingCleaning = (response) => {
  return response.substring(response.indexOf("{"), response.lastIndexOf("}") + 1)
}
