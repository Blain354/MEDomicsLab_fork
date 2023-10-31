package evaluation

import (
	"fmt"
	Utils "go_module/src"
	"sync"
)

var prePath = "evaluation"

// AddHandleFunc adds the specific module handle function to the server
func AddHandleFunc(wg *sync.WaitGroup) {
	Utils.CreateHandleFunc(prePath+"/open_dashboard/", handleOpenDashboard, wg)
	Utils.CreateHandleFunc(prePath+"/close_dashboard/", handleCloseDashboard, wg)
	Utils.CreateHandleFunc(prePath+"/progress/", handleProgress, wg)
	Utils.CreateHandleFunc(prePath+"/predict_test/", handlePredictTest, wg)

}

// handleOpenDashboard handles the request to open the dashboard
// It returns the response from the python script
func handleOpenDashboard(jsonConfig string, id string) (string, error) {
	fmt.Println("Running dashboard...", id)
	response, err := Utils.StartPythonScript(jsonConfig, "../flask_server/evaluation/scripts/open_dashboard.py", id)
	Utils.RemoveIdFromScripts(id)
	if err != nil {
		return "", err
	}
	return response, nil
}

// handleCloseDashboard handles the request to close the dashboard
// It returns the response from the python script
func handleCloseDashboard(jsonConfig string, id string) (string, error) {
	var ok = Utils.RemoveIdFromScripts(id)
	var toReturn = "closed successfully state : " + fmt.Sprint(ok)
	return toReturn, nil
}

// handleProgress handles the request to get the progress of the experiment
// It returns the progress of the experiment
func handleProgress(jsonConfig string, id string) (string, error) {
	Utils.Mu.Lock()
	script, ok := Utils.Scripts[id]
	Utils.Mu.Unlock()
	progress := ""
	if ok {
		progress = script.Progress
	}
	if progress != "" {
		return progress, nil
	} else {
		return "{\"now\":\"0\", \"currentLabel\":\"Warming up\"}", nil
	}
}

func handlePredictTest(jsonConfig string, id string) (string, error) {
	fmt.Println("Running predict test...", id)
	response, err := Utils.StartPythonScript(jsonConfig, "../flask_server/evaluation/scripts/predict_test.py", id)
	if err != nil {
		return "", err
	}
	Utils.RemoveIdFromScripts(id)
	return response, nil
}
