
import React from "react";
import { useContext } from "react";
import { OffCanvasBackdropStyleContext } from "./context/offCanvasBackdropStyleContext";

const Backdrop = ({pageId}) => {
	const { backdropStyle } = useContext(OffCanvasBackdropStyleContext);
	return (
		<>
			<div id={pageId} className='workflow-settings' style={backdropStyle}/>
		</>
	);
};


export default Backdrop;