console.log("Javascript Loaded");

const ModbusData = [];
const CustomerData = [];
var SampleCount = 3;
var pulseFlag = false;

CustomerData.push({Customer: 'UNION', FurnaceID: 'F1', IncludeDips: true, BurnerCount: 12});
CustomerData.push({Customer: 'UNION', FurnaceID: 'F2', IncludeDips: false, BurnerCount: 12});
//CustomerData.push({Customer: 'UNION', FurnaceID: 'F3', IncludeDips: true, BurnerCount: 8});
//CustomerData.push({Customer: 'UNION', FurnaceID: 'F4', IncludeDips: false, BurnerCount: 8});
//CustomerData.push({Customer: 'UNION', FurnaceID: 'F5', IncludeDips: true, BurnerCount: 4});
//CustomerData.push({Customer: 'UNION', FurnaceID: 'F6', IncludeDips: false, BurnerCount: 4});

var Customer = 'UNION';
var FurnaceID = 'F1';
var visible = true;

for(var i=0;i<CustomerData.length;i++){
	createLayout(CustomerData[i].Customer + "_" + CustomerData[i].FurnaceID,'tab_body',CustomerData[i].IncludeDips,CustomerData[i].BurnerCount,visible);
	visible = false;
}

function tabClicked(tabID){
	var ParentBodyDiv = document.getElementById('tab_body');
	var ParentTabDiv = document.getElementById('tab_row');
	for(i=0;i<ParentBodyDiv.childElementCount;i++){
		ParentBodyDiv.children[i].style.display = 'none';
	}
	
	for(i=0;i<ParentTabDiv.childElementCount;i++){
		ParentTabDiv.children[i].className = 'tabs tab_notselected';
	}
	document.getElementById(tabID + '_LANDING').style.display = '';
	document.getElementById(tabID).className = 'tabs tab_selected';
}

var updateHMI = function (FurnaceID) {
	document.getElementById(FurnaceID + '_HMI_CONTROLS_ZINCTEMP').innerHTML = ModbusData[0].ZINC_TEMP_PV + " °C";
	document.getElementById(FurnaceID + '_HMI_CONTROLS_ZINCSP').innerHTML = ModbusData[0].ZINC_PID_SP + " °C";
	document.getElementById(FurnaceID + '_HMI_CONTROLS_OUTPUT').innerHTML = ModbusData[0].PID_SEL_OP + " %";
	document.getElementById(FurnaceID + '_HMI_CONTROLS_FLUETEMP').innerHTML = ModbusData[0].FLUE_TEMP_PV + " °C";
	document.getElementById(FurnaceID + '_HMI_CONTROLS_FLUESP').innerHTML = ModbusData[0].FLUE_PID_SP + " °C";
	document.getElementById(FurnaceID + '_HMI_CONTROLS_GASFLOW').innerHTML = ModbusData[0].GAS_FLOW_PV + " m3/h";
	
	setBurnerGroup(FurnaceID,'A1',ModbusData[0].A1_PVALVE,ModbusData[0].A1_SGAS,ModbusData[0].A1_FAULT)
	setBurnerGroup(FurnaceID,'A2',ModbusData[0].A2_PVALVE,ModbusData[0].A2_SGAS,ModbusData[0].A2_FAULT)
	setBurnerGroup(FurnaceID,'A3',ModbusData[0].A3_PVALVE,ModbusData[0].A3_SGAS,ModbusData[0].A3_FAULT)
	setBurnerGroup(FurnaceID,'A4',ModbusData[0].A4_PVALVE,ModbusData[0].A4_SGAS,ModbusData[0].A4_FAULT)
	setBurnerGroup(FurnaceID,'A5',ModbusData[0].A5_PVALVE,ModbusData[0].A5_SGAS,ModbusData[0].A5_FAULT)
	setBurnerGroup(FurnaceID,'A6',ModbusData[0].A6_PVALVE,ModbusData[0].A6_SGAS,ModbusData[0].A6_FAULT)
	
	setBurnerGroup(FurnaceID,'B1',ModbusData[0].B1_PVALVE,ModbusData[0].B1_SGAS,ModbusData[0].B1_FAULT)
	setBurnerGroup(FurnaceID,'B2',ModbusData[0].B2_PVALVE,ModbusData[0].B2_SGAS,ModbusData[0].B2_FAULT)
	setBurnerGroup(FurnaceID,'B3',ModbusData[0].B3_PVALVE,ModbusData[0].B3_SGAS,ModbusData[0].B3_FAULT)
	setBurnerGroup(FurnaceID,'B4',ModbusData[0].B4_PVALVE,ModbusData[0].B4_SGAS,ModbusData[0].B4_FAULT)
	setBurnerGroup(FurnaceID,'B5',ModbusData[0].B5_PVALVE,ModbusData[0].B5_SGAS,ModbusData[0].B5_FAULT)
	setBurnerGroup(FurnaceID,'B6',ModbusData[0].B6_PVALVE,ModbusData[0].B6_SGAS,ModbusData[0].B6_FAULT)
}

function setBurnerGroup(FurnaceID,ID,VLV1,VLV2,FAULT){
	setValveState(FurnaceID + '_' + ID + '_AIR',VLV1,FAULT);
	setValveState(FurnaceID + '_' + ID + '_MGAS',VLV2,FAULT);
	setFlameState(FurnaceID + '_' + ID + '_FLAME',VLV2,VLV1);
}

function setFlameState(ID,MGAS,PULSE){
	var FLAME = document.getElementById(ID);
	if(MGAS){
		if(PULSE){
			FLAME.children[0].style.display = 'none';
			FLAME.children[1].style.display = 'flex';
		}else{
			FLAME.children[0].style.display = 'flex';
			FLAME.children[1].style.display = 'none';
		}
	} else {
		FLAME.children[0].style.display = 'none';
		FLAME.children[1].style.display = 'none';
	}
}

function setValveState(ID,STATE,FAULT){
	var VALVE = document.getElementById(ID);
	var STATE_VAL
	var BackColor = "";
	if(FAULT){STATE_VAL = 1;}else{if(STATE){STATE_VAL = 2;}else{STATE_VAL = 0;}}
	switch(STATE_VAL){
		case 0:
			BackColor = '#cccccc';
			break;
		case 1:
			if(pulseFlag){BackColor = 'red';}else{BackColor = 'white';};
			break;
		case 2:
			BackColor = '#33cc33';
			break;
	}
	VALVE.children[0].style.backgroundColor	= BackColor;
	VALVE.children[1].children[0].style.backgroundColor	= BackColor;
	VALVE.children[1].children[1].children[1].style.backgroundColor	= BackColor;
	VALVE.children[1].children[2].style.backgroundColor	= BackColor;
}

function createLayout(FurnaceID,ParentDivName,IncludeDips,BurnerCount,visible){
	var ParentDiv = document.getElementById(ParentDivName);
	
	var LANDING = document.createElement("div");
	var LANDING_HMI = document.createElement("div");
	var LANDING_HMI_CONTROLS = document.createElement("div");
	var LANDING_HMI_GRAPHICS = document.createElement("div");
	var LANDING_TREND = document.createElement("div");
	
	LANDING.appendChild(LANDING_HMI);
	LANDING.appendChild(LANDING_TREND);
	LANDING_HMI.appendChild(LANDING_HMI_CONTROLS);
	LANDING_HMI.appendChild(LANDING_HMI_GRAPHICS);
	
	LANDING.setAttribute('id',FurnaceID + '_LANDING');
	LANDING.setAttribute('class','landing');
	if(!visible){
		LANDING.setAttribute('style','display:none;');
	}
	LANDING_HMI.setAttribute('id',FurnaceID + '_LANDING_HMI');
	LANDING_HMI.setAttribute('class','landing-HMI');
	LANDING_HMI_CONTROLS.setAttribute('id',FurnaceID + '_LANDING_HMI_CONTROLS');
	LANDING_HMI_CONTROLS.setAttribute('class','HMI-Controls');
	LANDING_HMI_GRAPHICS.setAttribute('id',FurnaceID + '_LANDING_HMI_GRAPHICS');
	LANDING_HMI_GRAPHICS.setAttribute('class','HMI-Graphics');
	LANDING_TREND.setAttribute('id',FurnaceID + '_LANDING_TREND');
	LANDING_TREND.setAttribute('class','landing-TREND');
	
	ParentDiv.appendChild(LANDING);
	
	createTopControls(FurnaceID + '_LANDING_HMI_CONTROLS',FurnaceID,IncludeDips)
 	createSections(FurnaceID + '_LANDING_HMI_GRAPHICS',BurnerCount,FurnaceID);
}

function createTopControls(ParentDivName,FurnaceID,IncludeDips){
	var ParentDiv = document.getElementById(ParentDivName);
	var HMI_CONTROLS_ROW_1 = document.createElement("div");
	var HMI_CONTROLS_ROW_2 = document.createElement("div");
	var HMI_CONTROLS_ROW_3 = document.createElement("div");
	if(IncludeDips){
		var HMI_CONTROLS_DIPSH = document.createElement("div");
		var HMI_CONTROLS_DIPSH_LABEL = document.createElement("div");
		var HMI_CONTROLS_DIPSD = document.createElement("div");
		var HMI_CONTROLS_DIPSD_LABEL = document.createElement("div");
		var HMI_CONTROLS_NPN = document.createElement("div");
	}
	var HMI_CONTROLS_ZINCTEMP = document.createElement("div");
	var HMI_CONTROLS_ZINCTEMP_LABEL = document.createElement("div");
	var HMI_CONTROLS_FLUETEMP = document.createElement("div");
	var HMI_CONTROLS_FLUETEMP_LABEL = document.createElement("div");
	var HMI_CONTROLS_ZINCSP = document.createElement("div");
	var HMI_CONTROLS_ZINCSP_LABEL = document.createElement("div");
	var HMI_CONTROLS_FLUESP = document.createElement("div");
	var HMI_CONTROLS_FLUESP_LABEL = document.createElement("div");
	var HMI_CONTROLS_OUTPUT = document.createElement("div");
	var HMI_CONTROLS_OUTPUT_LABEL = document.createElement("div");
	var HMI_CONTROLS_GASFLOW = document.createElement("div");
	var HMI_CONTROLS_GASFLOW_LABEL = document.createElement("div");
	
	if(IncludeDips){
		HMI_CONTROLS_ROW_1.appendChild(HMI_CONTROLS_DIPSH_LABEL);
		HMI_CONTROLS_ROW_1.appendChild(HMI_CONTROLS_DIPSH);
	}
	HMI_CONTROLS_ROW_1.appendChild(HMI_CONTROLS_ZINCTEMP_LABEL);
	HMI_CONTROLS_ROW_1.appendChild(HMI_CONTROLS_ZINCTEMP);
	HMI_CONTROLS_ROW_1.appendChild(HMI_CONTROLS_FLUETEMP_LABEL);
	HMI_CONTROLS_ROW_1.appendChild(HMI_CONTROLS_FLUETEMP);
	
	if(IncludeDips){
		HMI_CONTROLS_ROW_2.appendChild(HMI_CONTROLS_DIPSD_LABEL);
		HMI_CONTROLS_ROW_2.appendChild(HMI_CONTROLS_DIPSD);
	}
	HMI_CONTROLS_ROW_2.appendChild(HMI_CONTROLS_ZINCSP_LABEL);
	HMI_CONTROLS_ROW_2.appendChild(HMI_CONTROLS_ZINCSP);
	HMI_CONTROLS_ROW_2.appendChild(HMI_CONTROLS_FLUESP_LABEL);
	HMI_CONTROLS_ROW_2.appendChild(HMI_CONTROLS_FLUESP);
	
	if(IncludeDips){
		HMI_CONTROLS_ROW_3.appendChild(HMI_CONTROLS_NPN);
	}
	HMI_CONTROLS_ROW_3.appendChild(HMI_CONTROLS_OUTPUT_LABEL);
	HMI_CONTROLS_ROW_3.appendChild(HMI_CONTROLS_OUTPUT);
	HMI_CONTROLS_ROW_3.appendChild(HMI_CONTROLS_GASFLOW_LABEL);
	HMI_CONTROLS_ROW_3.appendChild(HMI_CONTROLS_GASFLOW);
	
	HMI_CONTROLS_ROW_1.setAttribute('id',FurnaceID + '_HMI_CONTROLS_ROW_1');
	HMI_CONTROLS_ROW_1.setAttribute('class','HMI-ROW');
	HMI_CONTROLS_ROW_2.setAttribute('id',FurnaceID + '_HMI_CONTROLS_ROW_2');
	HMI_CONTROLS_ROW_2.setAttribute('class','HMI-ROW');
	HMI_CONTROLS_ROW_3.setAttribute('id',FurnaceID + '_HMI_CONTROLS_ROW_3');
	HMI_CONTROLS_ROW_3.setAttribute('class','HMI-ROW');
	
	
	if(IncludeDips){
		HMI_CONTROLS_DIPSH_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_DIPSH_LABEL');
		HMI_CONTROLS_DIPSH_LABEL.setAttribute('class','HMI-BLOCK HMI_CONT_DIP');
		HMI_CONTROLS_DIPSH.setAttribute('id',FurnaceID + '_HMI_CONTROLS_DIPSH');
		HMI_CONTROLS_DIPSH.setAttribute('class','HMI-BLOCK HMI_CONT_DATA');
	}
	
	HMI_CONTROLS_ZINCTEMP_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_ZINCTEMP_LABEL');
	HMI_CONTROLS_ZINCTEMP_LABEL.setAttribute('class','HMI-BLOCK HMI_CONT_PV');
	HMI_CONTROLS_ZINCTEMP.setAttribute('id',FurnaceID + '_HMI_CONTROLS_ZINCTEMP');
	HMI_CONTROLS_ZINCTEMP.setAttribute('class','HMI-BLOCK HMI_CONT_DATA');
	HMI_CONTROLS_FLUETEMP_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_FLUETEMP_LABEL');
	HMI_CONTROLS_FLUETEMP_LABEL.setAttribute('class','HMI-BLOCK HMI_CONT_PV');
	HMI_CONTROLS_FLUETEMP.setAttribute('id',FurnaceID + '_HMI_CONTROLS_FLUETEMP');
	HMI_CONTROLS_FLUETEMP.setAttribute('class','HMI-BLOCK HMI_CONT_DATA');
	
	if(IncludeDips){
		HMI_CONTROLS_DIPSD_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_DIPSD_LABEL');
		HMI_CONTROLS_DIPSD_LABEL.setAttribute('class','HMI-BLOCK HMI_CONT_DIP');
		HMI_CONTROLS_DIPSD.setAttribute('id',FurnaceID + '_HMI_CONTROLS_DIPSD');
		HMI_CONTROLS_DIPSD.setAttribute('class','HMI-BLOCK HMI_CONT_DATA');
	}
	
	HMI_CONTROLS_ZINCSP_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_ZINCSP_LABEL');
	HMI_CONTROLS_ZINCSP_LABEL.setAttribute('class','HMI-BLOCK HMI_CONT_SP');
	HMI_CONTROLS_ZINCSP.setAttribute('id',FurnaceID + '_HMI_CONTROLS_ZINCSP');
	HMI_CONTROLS_ZINCSP.setAttribute('class','HMI-BLOCK HMI_CONT_DATA');
	HMI_CONTROLS_FLUESP_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_FLUESP_LABEL');
	HMI_CONTROLS_FLUESP_LABEL.setAttribute('class','HMI-BLOCK HMI_CONT_SP');
	HMI_CONTROLS_FLUESP.setAttribute('id',FurnaceID + '_HMI_CONTROLS_FLUESP');
	HMI_CONTROLS_FLUESP.setAttribute('class','HMI-BLOCK HMI_CONT_DATA');
	
	if(IncludeDips){
		HMI_CONTROLS_NPN.setAttribute('id',FurnaceID + '_HMI_CONTROLS_NPN');
		HMI_CONTROLS_NPN.setAttribute('class','HMI_CONT_NPN HMI-BLOCK');
	}
	
	HMI_CONTROLS_OUTPUT_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_OUTPUT_LABEL');
	HMI_CONTROLS_OUTPUT_LABEL.setAttribute('class','HMI-BLOCK HMI_CONT_OUTPUT');
	HMI_CONTROLS_OUTPUT.setAttribute('id',FurnaceID + '_HMI_CONTROLS_OUTPUT');
	HMI_CONTROLS_OUTPUT.setAttribute('class','HMI-BLOCK HMI_CONT_DATA');
	HMI_CONTROLS_GASFLOW_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_GASFLOW_LABEL');
	HMI_CONTROLS_GASFLOW_LABEL.setAttribute('class','HMI-BLOCK HMI_CONT_GASFLOW');
	HMI_CONTROLS_GASFLOW.setAttribute('id',FurnaceID + '_HMI_CONTROLS_GASFLOW');
	HMI_CONTROLS_GASFLOW.setAttribute('class','HMI-BLOCK HMI_CONT_DATA');
	
	ParentDiv.appendChild(HMI_CONTROLS_ROW_1);
	ParentDiv.appendChild(HMI_CONTROLS_ROW_2);
	ParentDiv.appendChild(HMI_CONTROLS_ROW_3);
	
	if(IncludeDips){
		document.getElementById(FurnaceID + '_HMI_CONTROLS_DIPSH_LABEL').innerText = "Dips/H";
		document.getElementById(FurnaceID + '_HMI_CONTROLS_DIPSD_LABEL').innerText = "Dips/D";
	}
	
	document.getElementById(FurnaceID + '_HMI_CONTROLS_ZINCTEMP_LABEL').innerText = "Zinc Temp";
	document.getElementById(FurnaceID + '_HMI_CONTROLS_FLUETEMP_LABEL').innerText = "Flue Temp";
	document.getElementById(FurnaceID + '_HMI_CONTROLS_ZINCSP_LABEL').innerText = "Setpoint";
	document.getElementById(FurnaceID + '_HMI_CONTROLS_FLUESP_LABEL').innerText = "Setpoint";
	document.getElementById(FurnaceID + '_HMI_CONTROLS_OUTPUT_LABEL').innerText = "Output";
	document.getElementById(FurnaceID + '_HMI_CONTROLS_GASFLOW_LABEL').innerText = "Gas Flow";
}

function createSections(ParentDivName,BurnerCount,FurnaceID){
	var ParentDiv = document.getElementById(ParentDivName);
	var HMI_SECTION_LEFT = document.createElement("div");
	var HMI_SECTION_LEFT_TOP = document.createElement("div");
	var HMI_SECTION_LEFT_BOT = document.createElement("div");
	var HMI_SECTION_MIDDLE = document.createElement("div");
	var HMI_SECTION_MIDDLE_TOP = document.createElement("div");
	var HMI_SECTION_MIDDLE_BOT = document.createElement("div");
	var HMI_SECTION_RIGHT = document.createElement("div");
	var HMI_SECTION_RIGHT_TOP = document.createElement("div");
	var HMI_SECTION_RIGHT_BOT = document.createElement("div");
	
	HMI_SECTION_LEFT.appendChild(HMI_SECTION_LEFT_TOP);
	HMI_SECTION_LEFT.appendChild(HMI_SECTION_LEFT_BOT);
	HMI_SECTION_MIDDLE.appendChild(HMI_SECTION_MIDDLE_TOP);
	HMI_SECTION_MIDDLE.appendChild(HMI_SECTION_MIDDLE_BOT);
	HMI_SECTION_RIGHT.appendChild(HMI_SECTION_RIGHT_TOP);
	HMI_SECTION_RIGHT.appendChild(HMI_SECTION_RIGHT_BOT);
	
	HMI_SECTION_LEFT.setAttribute('id',FurnaceID + '_HMI_SECTION_LEFT');
	HMI_SECTION_LEFT.setAttribute('class','HMI_SECTION HMI_SIDE');
	HMI_SECTION_LEFT_TOP.setAttribute('id',FurnaceID + '_HMI_SECTION_LEFT_TOP');
	HMI_SECTION_LEFT_TOP.setAttribute('class','HMI_SECTION HMI_TOP');
	HMI_SECTION_LEFT_BOT.setAttribute('id',FurnaceID + '_HMI_SECTION_LEFT_BOT');
	HMI_SECTION_LEFT_BOT.setAttribute('class','HMI_SECTION HMI_BOT');
	
	HMI_SECTION_MIDDLE.setAttribute('id',FurnaceID + '_HMI_SECTION_MIDDLE');
	HMI_SECTION_MIDDLE.setAttribute('class','HMI_SECTION HMI_MIDDLE');
	HMI_SECTION_MIDDLE_TOP.setAttribute('id',FurnaceID + '_HMI_SECTION_MIDDLE_TOP');
	HMI_SECTION_MIDDLE_TOP.setAttribute('class','HMI_SECTION HMI_TOP');
	HMI_SECTION_MIDDLE_BOT.setAttribute('id',FurnaceID + '_HMI_SECTION_MIDDLE_BOT');
	HMI_SECTION_MIDDLE_BOT.setAttribute('class','HMI_SECTION HMI_BOT');
	
	HMI_SECTION_RIGHT.setAttribute('id',FurnaceID + '_HMI_SECTION_RIGHT');
	HMI_SECTION_RIGHT.setAttribute('class','HMI_SECTION HMI_SIDE');
	HMI_SECTION_RIGHT_TOP.setAttribute('id',FurnaceID + '_HMI_SECTION_RIGHT_TOP');
	HMI_SECTION_RIGHT_TOP.setAttribute('class','HMI_SECTION HMI_TOP');
	HMI_SECTION_RIGHT_BOT.setAttribute('id',FurnaceID + '_HMI_SECTION_RIGHT_BOT');
	HMI_SECTION_RIGHT_BOT.setAttribute('class','HMI_SECTION HMI_BOT');
	
	ParentDiv.appendChild(HMI_SECTION_LEFT);
	ParentDiv.appendChild(HMI_SECTION_MIDDLE);
	ParentDiv.appendChild(HMI_SECTION_RIGHT);
	
	createFanBlade(FurnaceID,FurnaceID + '_HMI_SECTION_MIDDLE_BOT',1);
	createFanBlade(FurnaceID,FurnaceID + '_HMI_SECTION_MIDDLE_BOT',2);
	
	for(var i=0;i<(BurnerCount/2);i++){
		var HeightVal = 90/6;
		var BurnerNum = i+1;
		var BurnerCalc = BurnerCount/4;
		if(i==0){
			createBurnerGroupSpacer(FurnaceID,0,0);
			};
		if(i==BurnerCalc){
			switch (BurnerCount/2){
				case 12:
					createBurnerGroupSpacer(FurnaceID,HeightVal,0);
					break;
				case 8:
					createBurnerGroupSpacer(FurnaceID,HeightVal,2);
					break;
				case 4:
					createBurnerGroupSpacer(FurnaceID,HeightVal,4);
					break;
			}
		}			
		//};
		createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_LEFT_TOP','A' + BurnerNum,'100%',HeightVal + '%',false)
		createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_RIGHT_TOP','B' + BurnerNum,'100%',HeightVal + '%',true)
	}
	
	
	// createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_LEFT_TOP','A1','100%',HeightVal + '%',false)
	// createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_LEFT_TOP','A2','100%',HeightVal + '%',false)
	// createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_LEFT_TOP','A3','100%',HeightVal + '%',false)
	// createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_LEFT_TOP','A4','100%',HeightVal + '%',false)
	// createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_LEFT_TOP','A5','100%',HeightVal + '%',false)
	// createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_LEFT_TOP','A6','100%',HeightVal + '%',false)
	// createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_RIGHT_TOP','B1','100%',HeightVal + '%',true)
	// createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_RIGHT_TOP','B2','100%',HeightVal + '%',true)
	// createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_RIGHT_TOP','B3','100%',HeightVal + '%',true)
	// createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_RIGHT_TOP','B4','100%',HeightVal + '%',true)
	// createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_RIGHT_TOP','B5','100%',HeightVal + '%',true)
	// createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_RIGHT_TOP','B6','100%',HeightVal + '%',true)
}

function createBurnerGroupSpacer(FurnaceID,HeightVal,SpacerCount){
	var LeftParentDiv = document.getElementById(FurnaceID + '_HMI_SECTION_LEFT_TOP');
	var RightParentDiv = document.getElementById(FurnaceID + '_HMI_SECTION_RIGHT_TOP');
	var LeftSpacer = document.createElement("div");
	var RightSpacer = document.createElement("div");
	
	var HeightCalc = HeightVal * SpacerCount + 5;
	
	LeftSpacer.setAttribute('id',FurnaceID + '_LeftSpacer');
	LeftSpacer.setAttribute('style','height:' + HeightCalc + '%;');
	RightSpacer.setAttribute('id',FurnaceID + '_RightSpacer');
	RightSpacer.setAttribute('style','height:' + HeightCalc + '%;');
	
	LeftParentDiv.appendChild(LeftSpacer);
	RightParentDiv.appendChild(RightSpacer);
}

function createBurnerGroup(FurnaceID,ParentDiv,ID,WidthVal,HeightVal,Reversed){
	var ParentDiv = document.getElementById(ParentDiv);
	var GROUP = document.createElement("div");
	var GROUP_C1 = document.createElement("div");
	var GROUP_C2 = document.createElement("div");
	var GROUP_C3 = document.createElement("div");
	var GROUP_C3_SPACER = document.createElement("div");
	var GROUP_C4 = document.createElement("div");
	var GROUP_C5 = document.createElement("div");
	var GROUP_C5_TOP = document.createElement("div");
	var GROUP_C5_BOT = document.createElement("div");
	var GROUP_LABEL = document.createElement("div");
	
	if(Reversed){
		GROUP.appendChild(GROUP_C5);
		GROUP.appendChild(GROUP_C4);
		GROUP.appendChild(GROUP_C3);
		GROUP.appendChild(GROUP_C2);
		GROUP.appendChild(GROUP_C1);
		GROUP_C3.appendChild(GROUP_C3_SPACER);
		GROUP_C5.appendChild(GROUP_C5_TOP);
		GROUP_C5.appendChild(GROUP_C5_BOT);
		GROUP_C5_BOT.appendChild(GROUP_LABEL);
	}else{
		GROUP.appendChild(GROUP_C1);
		GROUP.appendChild(GROUP_C2);
		GROUP.appendChild(GROUP_C3);
		GROUP.appendChild(GROUP_C4);
		GROUP.appendChild(GROUP_C5);
		GROUP_C3.appendChild(GROUP_C3_SPACER);
		GROUP_C5.appendChild(GROUP_C5_TOP);
		GROUP_C5.appendChild(GROUP_C5_BOT);
		GROUP_C5_BOT.appendChild(GROUP_LABEL);
	}
	
	GROUP.setAttribute('id',FurnaceID + '_' + ID + '_GROUP');
	GROUP.setAttribute('style','width: ' + WidthVal + '; height: ' + HeightVal + ';');
	GROUP.setAttribute('class','BURNER_GROUP');
	GROUP_C1.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C1');
	GROUP_C1.setAttribute('class','GROUP_C GROUP_C1');
	GROUP_C2.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C2');
	GROUP_C2.setAttribute('class','GROUP_C GROUP_C2');
	GROUP_C3.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C3');
	GROUP_C3.setAttribute('class','GROUP_C GROUP_C3');
	GROUP_C4.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C4');
	GROUP_C4.setAttribute('class','GROUP_C GROUP_C4');
	GROUP_C5.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C5');
	GROUP_C5.setAttribute('class','GROUP_C GROUP_C5');
	GROUP_C3_SPACER.setAttribute('class','AIR_SPACER');
	GROUP_C5_TOP.setAttribute('class','GROUP_C5_TOP');
	GROUP_C5_BOT.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C5_BOT');
	GROUP_C5_BOT.setAttribute('class','GROUP_C5_BOT');
	if(Reversed){GROUP_C5_BOT.setAttribute('style','flex-direction: row-reverse;')};
	GROUP_LABEL.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C5_LABEL');
	GROUP_LABEL.setAttribute('class','GROUP_LABEL');
	ParentDiv.appendChild(GROUP);
	
	
	 	
	createValve(FurnaceID,FurnaceID + '_' + ID + '_GROUP_C2',ID + '_MGAS','100%','50%');
	createValve(FurnaceID,FurnaceID + '_' + ID + '_GROUP_C3',ID + '_AIR','100%','50%');
	createFlame(FurnaceID,FurnaceID + '_' + ID + '_GROUP_C5_BOT',ID + '_FLAME','80%','100%',Reversed)
	
	document.getElementById(FurnaceID + '_' + ID + '_GROUP_C5_LABEL').innerText = ID;
}

function createFlame(FurnaceID,ParentDivName,ID,WidthVal,HeightVal,Reversed){
	var ParentDiv = document.getElementById(ParentDivName);
	var FLAME = document.createElement("div");
	var LO_FIRE = document.createElement("div");
	var LO_FIRE_1 = document.createElement("div");
	var LO_FIRE_2 = document.createElement("div");
	var LO_FIRE_3 = document.createElement("div");
	var HI_FIRE = document.createElement("div");
	var HI_FIRE_1 = document.createElement("div");
	var HI_FIRE_2 = document.createElement("div");
	var HI_FIRE_3 = document.createElement("div");
	var STYLE_EXTRA = "";
	if(Reversed){STYLE_EXTRA = " justify-content: flex-end;";};
	
	FLAME.appendChild(LO_FIRE);
	FLAME.appendChild(HI_FIRE);
	LO_FIRE.appendChild(LO_FIRE_1);
	LO_FIRE.appendChild(LO_FIRE_2);
	LO_FIRE.appendChild(LO_FIRE_3);
	HI_FIRE.appendChild(HI_FIRE_1);
	HI_FIRE.appendChild(HI_FIRE_2);
	HI_FIRE.appendChild(HI_FIRE_3);
	
	FLAME.setAttribute('id',FurnaceID + '_' + ID);
	FLAME.setAttribute('style','width: ' + WidthVal + '; height: ' + HeightVal + ';');
	FLAME.setAttribute('class','FLAME');
	LO_FIRE.setAttribute('class','FIRE');
	LO_FIRE.setAttribute('style','display:none;' + STYLE_EXTRA);
	LO_FIRE_1.setAttribute('class','LO_FIRE');
	LO_FIRE_2.setAttribute('class','LO_FIRE');
	LO_FIRE_3.setAttribute('class','LO_FIRE');
	HI_FIRE.setAttribute('class','FIRE');
	HI_FIRE.setAttribute('style','display:none;' + STYLE_EXTRA);
	HI_FIRE_1.setAttribute('class','HI_FIRE');
	HI_FIRE_2.setAttribute('class','HI_FIRE');
	HI_FIRE_3.setAttribute('class','HI_FIRE');
	
	ParentDiv.appendChild(FLAME);
}

function createValve(FurnaceID,ParentDivName,ID,WidthVal,HeightVal){
	var ParentDiv = document.getElementById(ParentDivName);
	var VALVE = document.createElement("div");
	var VALVE_TOP = document.createElement("div");
	var VALVE_BOTTOM = document.createElement("div");
	var VALVE_LEFT = document.createElement("div");
	var VALVE_RIGHT = document.createElement("div");
	var VALVE_MIDDLE = document.createElement("div");
	var VALVE_MIDDLE_TOP = document.createElement("div");
	var VALVE_MIDDLE_TOP_LEFT = document.createElement("div");
	var VALVE_MIDDLE_TOP_RIGHT = document.createElement("div");
	var VALVE_MIDDLE_MIDDLE = document.createElement("div");
	
	VALVE.appendChild(VALVE_TOP);
	VALVE.appendChild(VALVE_BOTTOM);
	VALVE_BOTTOM.appendChild(VALVE_LEFT);
	VALVE_BOTTOM.appendChild(VALVE_MIDDLE);
	VALVE_BOTTOM.appendChild(VALVE_RIGHT);
	VALVE_MIDDLE.appendChild(VALVE_MIDDLE_TOP);
	VALVE_MIDDLE.appendChild(VALVE_MIDDLE_MIDDLE);
	VALVE_MIDDLE_TOP.appendChild(VALVE_MIDDLE_TOP_LEFT);
	VALVE_MIDDLE_TOP.appendChild(VALVE_MIDDLE_TOP_RIGHT);
	
	VALVE.setAttribute('id',FurnaceID + '_' + ID);
	VALVE.setAttribute('style','width: ' + WidthVal + '; height: ' + HeightVal + ';');
	VALVE.setAttribute('class','VALVE');
	VALVE_TOP.setAttribute('class','VALVE_TOP');
	VALVE_BOTTOM.setAttribute('class','VALVE_BOTTOM');
	VALVE_LEFT.setAttribute('class','VALVE_SIDE');
	VALVE_MIDDLE.setAttribute('class','VALVE_MIDDLE');
	VALVE_RIGHT.setAttribute('class','VALVE_SIDE');
	VALVE_MIDDLE_TOP.setAttribute('class','VALVE_MIDDLE_TOP');
	VALVE_MIDDLE_TOP_LEFT.setAttribute('class','VALVE_MIDDLE_TOP_LEFT');
	VALVE_MIDDLE_TOP_RIGHT.setAttribute('class','VALVE_MIDDLE_TOP_RIGHT');
	VALVE_MIDDLE_MIDDLE.setAttribute('class','VALVE_MIDDLE_MIDDLE');
	
	ParentDiv.appendChild(VALVE);
}

function createFanBlade(FurnaceID,ParentDivName,ID){
	var ParentDiv = document.getElementById(ParentDivName);
	var FanBlade = document.createElement("img");
	
	FanBlade.setAttribute('id',FurnaceID + '_FanBlade_' + ID);
	FanBlade.setAttribute('src',getFanSvg());
	FanBlade.setAttribute('alt','Fan ' + ID);
	FanBlade.setAttribute('class','fan');
	
	ParentDiv.appendChild(FanBlade);
}

function getFanSvg(){
	return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOC4xLjEsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0iQ2FwYV8xIgogICB4PSIwcHgiCiAgIHk9IjBweCIKICAgdmlld0JveD0iMCAwIDYxMiA2MTIiCiAgIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDYxMiA2MTI7IgogICB4bWw6c3BhY2U9InByZXNlcnZlIgogICBzb2RpcG9kaTpkb2NuYW1lPSJGQU4uc3ZnIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjIgKDVjM2U4MGQsIDIwMTctMDgtMDYpIj48bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE0NCI+PHJkZjpSREY+PGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPjxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PjxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz48L2NjOldvcms+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PGRlZnMKICAgICBpZD0iZGVmczQyIiAvPjxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgICAgYm9yZGVyb3BhY2l0eT0iMSIKICAgICBvYmplY3R0b2xlcmFuY2U9IjEwIgogICAgIGdyaWR0b2xlcmFuY2U9IjEwIgogICAgIGd1aWRldG9sZXJhbmNlPSIxMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMCIKICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTM2NiIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI3MDUiCiAgICAgaWQ9Im5hbWVkdmlldzQwIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp6b29tPSIwLjg3NTgxNjk5IgogICAgIGlua3NjYXBlOmN4PSIzMDYiCiAgICAgaW5rc2NhcGU6Y3k9IjMwNiIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iLTgiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9Ii04IgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0iZzciIC8+PGcKICAgICBpZD0iZzciPjxwYXRoCiAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgaWQ9InBhdGg0IgogICAgICAgZD0ibSA1MjQuOTc2LDI2MC45MjQgYyAtMS4yMzgsLTYuMDE1IC0zLjgxOSwtMTAuMzA3IC04LjU1NCwtMTQuMjE4IC0zNy44NCwtMzEuMjcyIC05MC4zMTcsLTI5LjE3IC0xNTcuNDMzLDYuMzA1IC00LjM4LC00LjM4IC05LjEyMSwtOC4wODIgLTE0LjQzNCwtMTEuMjcgNDYuMjU3LC00MS40OTkgODguNDIzLC01OC45MjEgMTI2LjQ5NSwtNTIuMjY5IDExLjIyNSwxLjk2MSAxOC45OTgsLTEwLjkwMSAxMi4wNDMsLTE5LjkyNiAtMTUuNDM3LC0yMC4wMzUgLTMzLjAwNiwtMzYuMzQ3IC01NC4xMjgsLTUwLjI1OSAtNS4xMywtMy4zNzggLTkuOTg5LC00LjU4NiAtMTYuMTAzLC00LjAwNSAtNDguODY5LDQuNjQ1IC04NC40OSw0My4yMzggLTEwNi44NjMsMTE1Ljc4IC02LjE5NSwwIC0xMi4xNjUsMC43MzQgLTE4LjE3NSwyLjIzNyAzLjM2NSwtNjIuMDUyIDIwLjg2LC0xMDQuMTg3IDUyLjQ4NiwtMTI2LjQwNSA5LjMyNCwtNi41NSA1LjcyNSwtMjEuMTQxIC01LjU3NCwtMjIuNjA3IC0yNS4wODMsLTMuMjUxIC00OS4wNCwtMi4zNjMgLTczLjgxMywyLjczNyAtNi4wMTUsMS4yMzggLTEwLjMwNywzLjgxOSAtMTQuMjE4LDguNTU0IC0zMS4yNzIsMzcuODQgLTI5LjE3LDkwLjMxNyA2LjMwNSwxNTcuNDMzIC00LjM4LDQuMzggLTguMDgyLDkuMTIxIC0xMS4yNywxNC40MzQgLTQxLjQ5OSwtNDYuMjU3IC01OC45MjEsLTg4LjQyMyAtNTIuMjY5LC0xMjYuNDk1IDEuOTYxLC0xMS4yMjUgLTEwLjkwMSwtMTguOTk4IC0xOS45MjYsLTEyLjA0NCAtMjAuMDM1LDE1LjQzNyAtMzYuMzQ3LDMzLjAwNiAtNTAuMjU5LDU0LjEyOCAtMy4zNzgsNS4xMyAtNC41ODYsOS45ODkgLTQuMDA1LDE2LjEwMyA0LjY0NSw0OC44NjkgNDMuMjM4LDg0LjQ5IDExNS43OCwxMDYuODYzIDAsNi4xOTUgMC43MzQsMTIuMTY1IDIuMjM3LDE4LjE3NSAtNjIuMDUyLC0zLjM2NSAtMTA0LjE4NywtMjAuODYgLTEyNi40MDUsLTUyLjQ4NiAtNi41NSwtOS4zMjQgLTIxLjE0MSwtNS43MjUgLTIyLjYwNyw1LjU3NCAtMy4yNTEsMjUuMDgzIC0yLjM2Myw0OS4wNCAyLjczNyw3My44MTMgMS4yMzgsNi4wMTUgMy44MTksMTAuMzA3IDguNTU0LDE0LjIxOCAzNy44NCwzMS4yNzIgOTAuMzE3LDI5LjE3IDE1Ny40MzMsLTYuMzA1IDQuMzgsNC4zOCA5LjEyMSw4LjA4MiAxNC40MzQsMTEuMjcgLTQ2LjI1Nyw0MS40OTkgLTg4LjQyMyw1OC45MjEgLTEyNi40OTUsNTIuMjY5IC0xMS4yMjUsLTEuOTYxIC0xOC45OTgsMTAuOTAxIC0xMi4wNDMsMTkuOTI2IDE1LjQzNywyMC4wMzUgMzMuMDA2LDM2LjM0NyA1NC4xMjgsNTAuMjU5IDUuMTMsMy4zNzggOS45ODksNC41ODYgMTYuMTAzLDQuMDA1IDQ4Ljg2OSwtNC42NDUgODQuNDksLTQzLjIzOCAxMDYuODYzLC0xMTUuNzggNi4xOTUsMCAxMi4xNjUsLTAuNzM0IDE4LjE3NSwtMi4yMzggLTMuMzY1LDYyLjA1MiAtMjAuODYsMTA0LjE4NyAtNTIuNDg2LDEyNi40MDUgLTkuMzI0LDYuNTUgLTUuNzI1LDIxLjE0MSA1LjU3NCwyMi42MDcgMjUuMDgzLDMuMjUxIDQ5LjA0LDIuMzYzIDczLjgxMywtMi43MzcgNi4wMTUsLTEuMjM4IDEwLjMwNywtMy44MTkgMTQuMjE4LC04LjU1NCAzMS4yNzIsLTM3Ljg0IDI5LjE3LC05MC4zMTcgLTYuMzA1LC0xNTcuNDMzIDQuMzgsLTQuMzggOC4wODIsLTkuMTIxIDExLjI3LC0xNC40MzQgNDEuNDk5LDQ2LjI1NyA1OC45MjEsODguNDIzIDUyLjI2OSwxMjYuNDk1IC0xLjk2MSwxMS4yMjUgMTAuOTAxLDE4Ljk5OCAxOS45MjYsMTIuMDQzIDIwLjAzNSwtMTUuNDM3IDM2LjM0NywtMzMuMDA2IDUwLjI1OSwtNTQuMTI4IDMuMzc4LC01LjEzIDQuNTg2LC05Ljk4OSA0LjAwNSwtMTYuMTAzIC00LjY0NSwtNDguODY5IC00My4yMzgsLTg0LjQ5IC0xMTUuNzgsLTEwNi44NjMgMCwtNi4xOTUgLTAuNzM0LC0xMi4xNjUgLTIuMjM3LC0xOC4xNzUgNjIuMDUyLDMuMzY1IDEwNC4xODcsMjAuODYgMTI2LjQwNSw1Mi40ODYgNi41NSw5LjMyNCAyMS4xNDEsNS43MjUgMjIuNjA3LC01LjU3NCAzLjI1MSwtMjUuMDgyIDIuMzYzLC00OS4wMzcgLTIuNzM3LC03My44MTEgeiBNIDMwNiwzNjguNDQ5IGMgLTM0LjQ4OSwwIC02Mi40NDksLTI3Ljk2IC02Mi40NDksLTYyLjQ0OSAwLC0zNC40ODkgMjcuOTYsLTYyLjQ0OSA2Mi40NDksLTYyLjQ0OSAzNC40ODksMCA2Mi40NDksMjcuOTYgNjIuNDQ5LDYyLjQ0OSAwLDM0LjQ4OSAtMjcuOTYsNjIuNDQ5IC02Mi40NDksNjIuNDQ5IHoiIC8+PC9nPjxnCiAgICAgaWQ9Imc5IiAvPjxnCiAgICAgaWQ9ImcxMSIgLz48ZwogICAgIGlkPSJnMTMiIC8+PGcKICAgICBpZD0iZzE1IiAvPjxnCiAgICAgaWQ9ImcxNyIgLz48ZwogICAgIGlkPSJnMTkiIC8+PGcKICAgICBpZD0iZzIxIiAvPjxnCiAgICAgaWQ9ImcyMyIgLz48ZwogICAgIGlkPSJnMjUiIC8+PGcKICAgICBpZD0iZzI3IiAvPjxnCiAgICAgaWQ9ImcyOSIgLz48ZwogICAgIGlkPSJnMzEiIC8+PGcKICAgICBpZD0iZzMzIiAvPjxnCiAgICAgaWQ9ImczNSIgLz48ZwogICAgIGlkPSJnMzciIC8+PC9zdmc+"
}
