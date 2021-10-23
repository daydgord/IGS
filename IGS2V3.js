  const ModbusData = [];
	const CustomerData = [];
	var SampleCount = 3;
	var pulseFlag = false;
	var LoopUp = true;
	var toggle = false;
	var Customer = 'APG';
	var FurnaceID = 'APG';
	var visible = true;
	var centerTop = 14;
	var TopMaximised = false;
	var USESIM = false;

	Main();
	
	function GetArduinoInputs()
        {
            try{
				nocache = "&nocache=" + Math.random() * 1000000;
				var request = new XMLHttpRequest();
				request.onreadystatechange = function()
				{
					if (this.readyState == 4) {
						if (this.status == 200) {
							if (this.responseXML != null) {
								// extract XML data from XML file (containing switch states and analog value)
								ModbusData[0].ZINC_TEMP_PV = this.responseXML.getElementsByTagName('zincTemp')[0].childNodes[0].nodeValue;
								ModbusData[0].FLUE_TEMP_PV = this.responseXML.getElementsByTagName('flueTemp')[0].childNodes[0].nodeValue;
								ModbusData[0].BURNER_1_INT = this.responseXML.getElementsByTagName('burner1')[0].childNodes[0].nodeValue;
								ModbusData[0].BURNER_2_INT = this.responseXML.getElementsByTagName('burner2')[0].childNodes[0].nodeValue;
								ModbusData[0].BURNER_3_INT = this.responseXML.getElementsByTagName('burner3')[0].childNodes[0].nodeValue;
								ModbusData[0].BURNER_4_INT = this.responseXML.getElementsByTagName('burner4')[0].childNodes[0].nodeValue;
								ModbusData[0].ZONE_A_INT = this.responseXML.getElementsByTagName('zoneA')[0].childNodes[0].nodeValue;
								ModbusData[0].ZONE_B_INT = this.responseXML.getElementsByTagName('zoneB')[0].childNodes[0].nodeValue;
							}
						}
					}
				}
				request.open("GET", "ajax_inputs" + nocache, true);
				request.send(null);
				updateHMI(0);
				//console.log(ModbusData[0].ZINC_TEMP_PV);
				setTimeout('GetArduinoInputs()', 2000);
			} catch(err){
			
			}
        }

	function Main(){
		CustomerData.push({Customer: 'APG', FurnaceID: 'APG2', IncludeDips: false, BurnerCount: 8});
		for(var i=0;i<CustomerData.length;i++){
			if(CustomerData[i].BurnerCount == 12){centerTop = 10.75;};
			createLayout(CustomerData[i].Customer + "_" + CustomerData[i].FurnaceID,'tab_body',CustomerData[i].IncludeDips,CustomerData[i].BurnerCount,visible);
			defineModbusData(i);
			visible = false;
		};
		if(CustomerData.length > 1){
			document.getElementById('tab_row').style.display = "";
			document.documentElement.style.setProperty('--port_height', '48.5vh');
			document.documentElement.style.setProperty('--land_height', '94vh');
		};
		GetArduinoInputs();
		//setInterval(function() {GetADC_TEST();}, 1000); // Gets ADC value at every one second
	}

	function defineChart(){
		window.chartColors = {
			red: 'rgb(255, 99, 132)',
			orange: 'rgb(255, 159, 64)',
			yellow: 'rgb(255, 205, 86)',
			green: 'rgb(75, 192, 192)',
			blue: 'rgb(54, 162, 235)',
			purple: 'rgb(153, 102, 255)',
			grey: 'rgb(201, 203, 207)'
		};
		var color = Chart.helpers.color;
		var ctx = document.getElementById('myChart').getContext('2d');
		var myChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
				datasets: [{
					label: '# of Votes',
					data: [12, 19, 3, 5, 2, 3],
					backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
					borderColor: window.chartColors.red,
					pointRadius: 0,
					fill: false,
					lineTension: 0,
					borderWidth: 2
				}]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true
						}
					}]
				}
			}
		});
	}

	function GetADC_TEST(){		
		updateHMI(0);
		if(!USESIM){GetADC();}
		simulator(0);
	}

	function GetADC() {
		var xhttp = new XMLHttpRequest();
		//var adc=0;
		var adc_text="";
		var adc_array;
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				
				
				adc_text = this.responseText;
				adc_array = adc_text.split(',');
				ModbusData[0].ZINC_TEMP_PV = Number(adc_array[0])/10;
				ModbusData[0].FLUE_TEMP_PV = Number(adc_array[1])/10;
				
				
				//adc = Number(this.responseText);
				//ModbusData[0].ZINC_TEMP_PV = adc/10;
				//ModbusData[0].FLUE_TEMP_PV = adc/10;
			}
		};
		xhttp.open("GET", "/getADC", false);
		xhttp.send();
	}

	function simulator(ID){
		if(LoopUp){
			ModbusData[ID].FAN_1_SPEED = ModbusData[ID].FAN_1_SPEED + 10;
		} else {
			ModbusData[ID].FAN_1_SPEED = ModbusData[ID].FAN_1_SPEED - 10;
		}
		if(ModbusData[ID].FAN_1_SPEED > 100){ModbusData[ID].FAN_1_SPEED = 90;LoopUp = false;toggle = true;};
		if(ModbusData[ID].FAN_1_SPEED < ID){ModbusData[ID].FAN_1_SPEED = 10;LoopUp = true;};
		
		//ModbusData[ID].ZINC_TEMP_PV = ModbusData[ID].FAN_1_SPEED;
		ModbusData[ID].ZINC_PID_SP = ModbusData[ID].FAN_1_SPEED;
		ModbusData[ID].PID_SEL_OP = ModbusData[ID].FAN_1_SPEED;
		//ModbusData[ID].FLUE_TEMP_PV = ModbusData[ID].FAN_1_SPEED;
		ModbusData[ID].FLUE_PID_SP = ModbusData[ID].FAN_1_SPEED;
		ModbusData[ID].GAS_FLOW_PV = ModbusData[ID].FAN_1_SPEED;
		ModbusData[ID].FAN_2_SPEED = ModbusData[ID].FAN_1_SPEED;
		
		if(ModbusData[ID].A1_PVALVE){
			FanColorRed(CustomerData[ID].Customer + "_" + CustomerData[ID].FurnaceID,1);
			FanColorRed(CustomerData[ID].Customer + "_" + CustomerData[ID].FurnaceID,2);
		}else{
			FanColorReset(CustomerData[ID].Customer + "_" + CustomerData[ID].FurnaceID,1);
			FanColorReset(CustomerData[ID].Customer + "_" + CustomerData[ID].FurnaceID,2);
		}
		ModbusData[ID].AM_PRESS = !ModbusData[ID].AM_PRESS;
		ModbusData[ID].BM_PRESS = !ModbusData[ID].BM_PRESS;
		if(toggle){
			toggle = false;
			ModbusData[ID].A1_PVALVE = !ModbusData[ID].A1_PVALVE;
			ModbusData[ID].A2_PVALVE = !ModbusData[ID].A2_PVALVE;
			ModbusData[ID].A3_PVALVE = !ModbusData[ID].A3_PVALVE;
			ModbusData[ID].A4_PVALVE = !ModbusData[ID].A4_PVALVE;
			ModbusData[ID].A5_PVALVE = !ModbusData[ID].A5_PVALVE;
			ModbusData[ID].A6_PVALVE = !ModbusData[ID].A6_PVALVE;
			ModbusData[ID].A1_PRESS = !ModbusData[ID].A1_PRESS;
			ModbusData[ID].A2_PRESS = !ModbusData[ID].A2_PRESS;
			ModbusData[ID].A3_PRESS = !ModbusData[ID].A3_PRESS;
			ModbusData[ID].A4_PRESS = !ModbusData[ID].A4_PRESS;
			ModbusData[ID].A5_PRESS = !ModbusData[ID].A5_PRESS;
			ModbusData[ID].A6_PRESS = !ModbusData[ID].A6_PRESS;
	/* 		ModbusData[ID].A1_SGAS = !ModbusData[ID].A1_SGAS;
			ModbusData[ID].A2_SGAS = !ModbusData[ID].A2_SGAS;
			ModbusData[ID].A3_SGAS = !ModbusData[ID].A3_SGAS;
			ModbusData[ID].A4_SGAS = !ModbusData[ID].A4_SGAS;
			ModbusData[ID].A5_SGAS = !ModbusData[ID].A5_SGAS;
			ModbusData[ID].A6_SGAS = !ModbusData[ID].A6_SGAS; */
			/* ModbusData[ID].A1_FAULT = !ModbusData[ID].A1_FAULT;
			ModbusData[ID].A2_FAULT = !ModbusData[ID].A2_FAULT;
			ModbusData[ID].A3_FAULT = !ModbusData[ID].A3_FAULT;
			ModbusData[ID].A4_FAULT = !ModbusData[ID].A4_FAULT;
			ModbusData[ID].A5_FAULT = !ModbusData[ID].A5_FAULT;
			ModbusData[ID].A6_FAULT = !ModbusData[ID].A6_FAULT; */
			ModbusData[ID].B1_PVALVE = !ModbusData[ID].B1_PVALVE;
			ModbusData[ID].B2_PVALVE = !ModbusData[ID].B2_PVALVE;
			ModbusData[ID].B3_PVALVE = !ModbusData[ID].B3_PVALVE;
			ModbusData[ID].B4_PVALVE = !ModbusData[ID].B4_PVALVE;
			ModbusData[ID].B5_PVALVE = !ModbusData[ID].B5_PVALVE;
			ModbusData[ID].B6_PVALVE = !ModbusData[ID].B6_PVALVE;
			ModbusData[ID].B1_PRESS = !ModbusData[ID].B1_PRESS;
			ModbusData[ID].B2_PRESS = !ModbusData[ID].B2_PRESS;
			ModbusData[ID].B3_PRESS = !ModbusData[ID].B3_PRESS;
			ModbusData[ID].B4_PRESS = !ModbusData[ID].B4_PRESS;
			ModbusData[ID].B5_PRESS = !ModbusData[ID].B5_PRESS;
			ModbusData[ID].B6_PRESS = !ModbusData[ID].B6_PRESS;
	/* 		ModbusData[ID].B1_SGAS = !ModbusData[ID].B1_SGAS;
			ModbusData[ID].B2_SGAS = !ModbusData[ID].B2_SGAS;
			ModbusData[ID].B3_SGAS = !ModbusData[ID].B3_SGAS;
			ModbusData[ID].B4_SGAS = !ModbusData[ID].B4_SGAS;
			ModbusData[ID].B5_SGAS = !ModbusData[ID].B5_SGAS;
			ModbusData[ID].B6_SGAS = !ModbusData[ID].B6_SGAS; */
			/* ModbusData[ID].B1_FAULT = !ModbusData[ID].B1_FAULT;
			ModbusData[ID].B2_FAULT = !ModbusData[ID].B2_FAULT;
			ModbusData[ID].B3_FAULT = !ModbusData[ID].B3_FAULT;
			ModbusData[ID].B4_FAULT = !ModbusData[ID].B4_FAULT;
			ModbusData[ID].B5_FAULT = !ModbusData[ID].B5_FAULT;
			ModbusData[ID].B6_FAULT = !ModbusData[ID].B6_FAULT; */
		}
	}

	function setFanSpeed(FanNumber,ID){
		var fanSpeeds = 0;
		if(FanNumber == 1){
			fanSpeeds = ModbusData[ID].FAN_1_SPEED;
			document.getElementById('FAN_' + FanNumber + '_BOX_RIGHT_BOT').innerText = ModbusData[ID].FAN_1_SPEED + "%";
			};
		if(FanNumber == 2){
			fanSpeeds = ModbusData[ID].FAN_2_SPEED;
			document.getElementById('FAN_' + FanNumber + '_BOX_RIGHT_BOT').innerText = ModbusData[ID].FAN_2_SPEED + "%";
		};
		var calcSpeed = 0;
		if((105 - fanSpeeds) < 105){
			calcSpeed = (105 - fanSpeeds)/10
		};
		document.documentElement.style.setProperty('--fan-' + FanNumber + '-speed', calcSpeed.toFixed(1) + 's');
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
	
	function INTOTBOOL(MyIntVal){
		var thisBitArray = [false,false,false,false,false,false,false,false];
		
		function dec2bin(dec){
		  return (dec >>> 0).toString(2);
		}
		
		if(MyIntVal > 255){
			MyIntVal = 255;
		}
		
		var intText = dec2bin(MyIntVal);
		
		for(i=0;i<8;i++){
			var thisChar = intText[i];
			if(thisChar == '1'){
			thisBitArray[i] = true;
			}
		}
		
		return thisBitArray;
	}
	
	function decodeBurner(ID,BurnerID){
		switch(BurnerID){
			case 1:
				var thisArray = INTOTBOOL(ModbusData[ID].BURNER_1_INT);
				ModbusData[ID].A1_FAULT = thisArray[0];
				ModbusData[ID].A1_SGAS = thisArray[1];
				ModbusData[ID].A1_PRESS = thisArray[2];
				ModbusData[ID].A1_PVALVE = thisArray[3];
				ModbusData[ID].B1_FAULT = thisArray[4];
				ModbusData[ID].B1_SGAS = thisArray[5];
				ModbusData[ID].B1_PRESS = thisArray[6];
				ModbusData[ID].B1_PVALVE = thisArray[7];
				break;
			case 2:
				var thisArray = INTOTBOOL(ModbusData[ID].BURNER_2_INT);
				ModbusData[ID].A2_FAULT = thisArray[0];
				ModbusData[ID].A2_SGAS = thisArray[1];
				ModbusData[ID].A2_PRESS = thisArray[2];
				ModbusData[ID].A2_PVALVE = thisArray[3];
				ModbusData[ID].B2_FAULT = thisArray[4];
				ModbusData[ID].B2_SGAS = thisArray[5];
				ModbusData[ID].B2_PRESS = thisArray[6];
				ModbusData[ID].B2_PVALVE = thisArray[7];
				break;
			case 3:
				var thisArray = INTOTBOOL(ModbusData[ID].BURNER_3_INT);
				ModbusData[ID].A3_FAULT = thisArray[0];
				ModbusData[ID].A3_SGAS = thisArray[1];
				ModbusData[ID].A3_PRESS = thisArray[2];
				ModbusData[ID].A3_PVALVE = thisArray[3];
				ModbusData[ID].B3_FAULT = thisArray[4];
				ModbusData[ID].B3_SGAS = thisArray[5];
				ModbusData[ID].B3_PRESS = thisArray[6];
				ModbusData[ID].B3_PVALVE = thisArray[7];
				break;
			case 4:
				var thisArray = INTOTBOOL(ModbusData[ID].BURNER_4_INT);
				ModbusData[ID].A4_FAULT = thisArray[0];
				ModbusData[ID].A4_SGAS = thisArray[1];
				ModbusData[ID].A4_PRESS = thisArray[2];
				ModbusData[ID].A4_PVALVE = thisArray[3];
				ModbusData[ID].B4_FAULT = thisArray[4];
				ModbusData[ID].B4_SGAS = thisArray[5];
				ModbusData[ID].B4_PRESS = thisArray[6];
				ModbusData[ID].B4_PVALVE = thisArray[7];
				break;
		}
		
	}
	
	function decodeZone(ID,ZoneID){
		switch(ZoneID){
			case 1:
				var thisArray = INTOTBOOL(ModbusData[ID].ZONE_A_INT);
				ModbusData[ID].ZAPurge = thisArray[0];
				ModbusData[ID].ZAPComp = thisArray[1];
				ModbusData[ID].AM_PRESS = thisArray[2];
				ModbusData[ID].ZAFanON = thisArray[3];
				ModbusData[ID].ZAFanFault = thisArray[4];
				break;
			case 2:
				var thisArray = INTOTBOOL(ModbusData[ID].ZONE_B_INT);
				ModbusData[ID].ZBPurge = thisArray[0];
				ModbusData[ID].ZBPComp = thisArray[1];
				ModbusData[ID].BM_PRESS = thisArray[2];
				ModbusData[ID].ZBFanON = thisArray[3];
				ModbusData[ID].ZBFanFault = thisArray[4];
				break;
		}
		
	}

	function updateHMI(ID) {
		decodeBurner(ID,1);
		decodeBurner(ID,2);
		decodeBurner(ID,3);
		decodeBurner(ID,4);
		decodeZone(ID,1);
		decodeZone(ID,2);
		var FurnaceID = CustomerData[ID].Customer + "_" + CustomerData[ID].FurnaceID;
		document.getElementById(FurnaceID + '_HMI_CONTROLS_ZINCTEMP').innerHTML = ModbusData[ID].ZINC_TEMP_PV + " °C";
		document.getElementById(FurnaceID + '_HMI_CONTROLS_ZINCSP').innerHTML = ModbusData[ID].ZINC_PID_SP + " °C";
		document.getElementById(FurnaceID + '_HMI_CONTROLS_OUTPUT').innerHTML = ModbusData[ID].PID_SEL_OP + " %";
		document.getElementById(FurnaceID + '_HMI_CONTROLS_FLUETEMP').innerHTML = ModbusData[ID].FLUE_TEMP_PV + " °C";
		document.getElementById(FurnaceID + '_HMI_CONTROLS_FLUESP').innerHTML = ModbusData[ID].FLUE_PID_SP + " °C";
		document.getElementById(FurnaceID + '_HMI_CONTROLS_GASFLOW').innerHTML = ModbusData[ID].GAS_FLOW_PV + " m3/h";
		document.getElementById(FurnaceID + '_HMI_SECTION_MIDDLE_TOP_BACK_TEXT').innerHTML = CustomerData[ID].FurnaceID;
		setBurnerGroup(FurnaceID,'A1',ModbusData[ID].A1_PVALVE,ModbusData[ID].A1_SGAS,ModbusData[ID].A1_FAULT)
		setBurnerGroup(FurnaceID,'A2',ModbusData[ID].A2_PVALVE,ModbusData[ID].A2_SGAS,ModbusData[ID].A2_FAULT)
		setBurnerGroup(FurnaceID,'B1',ModbusData[ID].B1_PVALVE,ModbusData[ID].B1_SGAS,ModbusData[ID].B1_FAULT)
		setBurnerGroup(FurnaceID,'B2',ModbusData[ID].B2_PVALVE,ModbusData[ID].B2_SGAS,ModbusData[ID].B2_FAULT)
		setPressState('PRESS_1_MAIN',ModbusData[ID].AM_PRESS);
		setPressState('PRESS_1_1',ModbusData[ID].A1_PRESS);
		setPressState('PRESS_1_2',ModbusData[ID].A2_PRESS);
		setPressState('PRESS_2_MAIN',ModbusData[ID].BM_PRESS);
		setPressState('PRESS_2_1',ModbusData[ID].B1_PRESS);
		setPressState('PRESS_2_2',ModbusData[ID].B2_PRESS);
		if(CustomerData[ID].BurnerCount > 4){
			setBurnerGroup(FurnaceID,'A3',ModbusData[ID].A3_PVALVE,ModbusData[ID].A3_SGAS,ModbusData[ID].A3_FAULT)
			setBurnerGroup(FurnaceID,'B3',ModbusData[ID].B3_PVALVE,ModbusData[ID].B3_SGAS,ModbusData[ID].B3_FAULT)
			setPressState('PRESS_1_3',ModbusData[ID].A3_PRESS);
			setPressState('PRESS_2_3',ModbusData[ID].B3_PRESS);
		}
		if(CustomerData[ID].BurnerCount > 6){
			setBurnerGroup(FurnaceID,'A4',ModbusData[ID].A4_PVALVE,ModbusData[ID].A4_SGAS,ModbusData[ID].A4_FAULT)
			setBurnerGroup(FurnaceID,'B4',ModbusData[ID].B4_PVALVE,ModbusData[ID].B4_SGAS,ModbusData[ID].B4_FAULT)
			setPressState('PRESS_1_4',ModbusData[ID].A4_PRESS);
			setPressState('PRESS_2_4',ModbusData[ID].B4_PRESS);
		};
		if(CustomerData[ID].BurnerCount > 8){
			setBurnerGroup(FurnaceID,'A5',ModbusData[ID].A5_PVALVE,ModbusData[ID].A5_SGAS,ModbusData[ID].A5_FAULT)
			setBurnerGroup(FurnaceID,'B5',ModbusData[ID].B5_PVALVE,ModbusData[ID].B5_SGAS,ModbusData[ID].B5_FAULT)
			setPressState('PRESS_1_5',ModbusData[ID].A5_PRESS);
			setPressState('PRESS_2_5',ModbusData[ID].B5_PRESS);
		};
		if(CustomerData[ID].BurnerCount > 10){
			setBurnerGroup(FurnaceID,'A6',ModbusData[ID].A6_PVALVE,ModbusData[ID].A6_SGAS,ModbusData[ID].A6_FAULT)
			setBurnerGroup(FurnaceID,'B6',ModbusData[ID].B6_PVALVE,ModbusData[ID].B6_SGAS,ModbusData[ID].B6_FAULT)
			setPressState('PRESS_1_6',ModbusData[ID].A6_PRESS);
			setPressState('PRESS_2_6',ModbusData[ID].B6_PRESS);
		};
		setFanSpeed(1,ID);
		setFanSpeed(2,ID);
	}

	function defineModbusData(ID){
		ModbusData.push({
			ZINC_TEMP_PV:0,
			ZINC_PID_SP:0,
			PID_SEL_OP:0,
			FLUE_TEMP_PV:0,
			FLUE_PID_SP:0,
			GAS_FLOW_PV:0,
			FAN_1_SPEED:0,
			FAN_2_SPEED:0,
			BURNER_1_INT:0,
			BURNER_2_INT:0,
			BURNER_3_INT:0,
			BURNER_4_INT:0,
			ZONE_A_INT:0,
			ZONE_B_INT:0,
			ZAPurge:false,
			ZAPComp:false,
			ZAFanON:false,
			ZAFanFault:false,
			ZBPurge:false,
			ZBPComp:false,
			ZBFanON:false,
			ZBFanFault:false,
			AM_PRESS:false,
			A1_PRESS:false,
			A2_PRESS:false,
			A3_PRESS:false,
			A4_PRESS:false,
			A5_PRESS:false,
			A6_PRESS:false,
			BM_PRESS:false,
			B1_PRESS:false,
			B2_PRESS:false,
			B3_PRESS:false,
			B4_PRESS:false,
			B5_PRESS:false,
			B6_PRESS:false,
			A1_PVALVE:false,
			A2_PVALVE:false,
			A3_PVALVE:false,
			A4_PVALVE:false,
			A5_PVALVE:false,
			A6_PVALVE:false,
			B1_PVALVE:false,
			B2_PVALVE:false,
			B3_PVALVE:false,
			B4_PVALVE:false,
			B5_PVALVE:false,
			B6_PVALVE:false,
			A1_SGAS:false,
			A2_SGAS:false,
			A3_SGAS:false,
			A4_SGAS:false,
			A5_SGAS:false,
			A6_SGAS:false,
			B1_SGAS:false,
			B2_SGAS:false,
			B3_SGAS:false,
			B4_SGAS:false,
			B5_SGAS:false,
			B6_SGAS:false,
			A1_FAULT:false,
			A2_FAULT:false,
			A3_FAULT:false,
			A4_FAULT:false,
			A5_FAULT:false,
			A6_FAULT:false,
			B1_FAULT:false,
			B2_FAULT:false,
			B3_FAULT:false,
			B4_FAULT:false,
			B5_FAULT:false,
			B6_FAULT:false
		});
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

	function setPressState(ID,STATE){
		var PRESS = document.getElementById(ID);
		switch(STATE){
			case true:
				BackColor = '#00e600';
				break;
			case false:
				BackColor = '#FFFFFF';
				break;
		}
		PRESS.style.backgroundColor = BackColor;
	}

	function createLayout(FurnaceID,ParentDivName,IncludeDips,BurnerCount,visible){
		var ParentDiv = document.getElementById(ParentDivName);
		var LANDING = document.createElement("div");
		var LANDING_HMI = document.createElement("div");
		var LANDING_HMI_CONTROLS = document.createElement("div");
		var LANDING_HMI_GRAPHICS = document.createElement("div");
		var LANDING_TREND = document.createElement("div");
		var LANDINF_TREND_CANVAS = document.createElement("canvas");
		LANDING.appendChild(LANDING_HMI);
		LANDING.appendChild(LANDING_TREND);
		LANDING_TREND.appendChild(LANDINF_TREND_CANVAS);
		LANDING_HMI.appendChild(LANDING_HMI_CONTROLS);
		LANDING_HMI.appendChild(LANDING_HMI_GRAPHICS);
		LANDING.setAttribute('id',FurnaceID + '_LANDING');
		LANDING.setAttribute('class','landing');
		if(!visible){LANDING.setAttribute('style','display:none;');};
		LANDING_HMI.setAttribute('id',FurnaceID + '_LANDING_HMI');
		LANDING_HMI.setAttribute('class','landing-HMI');
		LANDING_HMI_CONTROLS.setAttribute('id',FurnaceID + '_LANDING_HMI_CONTROLS');
		LANDING_HMI_CONTROLS.setAttribute('class','HMI_CONTROLS');
		LANDING_HMI_CONTROLS.setAttribute('onClick','TopControlsClicked(this);');
		LANDING_HMI_GRAPHICS.setAttribute('id',FurnaceID + '_LANDING_HMI_GRAPHICS');
		LANDING_HMI_GRAPHICS.setAttribute('class','HMI_GRAPHICS');
		LANDING_TREND.setAttribute('id',FurnaceID + '_LANDING_TREND');
		LANDING_TREND.setAttribute('class','landing-TREND');
		LANDINF_TREND_CANVAS.setAttribute('id','myChart');
		LANDINF_TREND_CANVAS.setAttribute('class','myChart');
		
		ParentDiv.appendChild(LANDING);
		createTopControls(FurnaceID + '_LANDING_HMI_CONTROLS',FurnaceID,IncludeDips);
		createSections(FurnaceID + '_LANDING_HMI_GRAPHICS',BurnerCount,FurnaceID);
		defineChart();
	}

	function TopControlsClicked(ElementData){
		var Element_Data = ElementData.id.split('_');
		var ControlsArea = document.getElementById(Element_Data[0] + '_' + Element_Data[1] + '_LANDING_HMI_CONTROLS');
		var GraphicsArea = document.getElementById(Element_Data[0] + '_' + Element_Data[1] + '_LANDING_HMI_GRAPHICS');
		var TrendArea = document.getElementById(Element_Data[0] + '_' + Element_Data[1] + '_LANDING_TREND');
		if(TopMaximised){
			console.log("Minimising");
			GraphicsArea.style.display = '';
			TrendArea.style.display = '';
			ControlsArea.className = 'HMI_CONTROLS';
		}else{
			console.log("Maximising");
			GraphicsArea.style.display = 'none';
			TrendArea.style.display = 'none';
			ControlsArea.className = 'HMI_CONTROLS_MAX';
		};
		toggleMaxControls(Element_Data[0] + '_' + Element_Data[1]);
		TopMaximised = !TopMaximised;
	}

	function toggleMaxControls(FurnaceID){
		ToggleMaxWrapper(FurnaceID,'ZINC');
		ToggleMaxWrapper(FurnaceID,'FLUE');
		ToggleMax(FurnaceID,'ZINCSP');
		ToggleMax(FurnaceID,'FLUESP');
		ToggleMax(FurnaceID,'OUTPUT');
		ToggleMax(FurnaceID,'GASFLOW');
		ToggleTopRowMax(FurnaceID,1);
		ToggleBotRowMax(FurnaceID,2);
	};

	function ToggleTopRowMax(FurnaceID,RowNumber){
		if(TopMaximised){
			classReplace(FurnaceID + '_HMI_CONTROLS_ROW_' + RowNumber,'HMI_ROW_TOP_MAX','HMI_ROW_TOP');
		} else {
			classReplace(FurnaceID + '_HMI_CONTROLS_ROW_' + RowNumber,'HMI_ROW_TOP','HMI_ROW_TOP_MAX');
		};
	}

	function ToggleBotRowMax(FurnaceID,RowNumber){
		if(TopMaximised){
			classReplace(FurnaceID + '_HMI_CONTROLS_ROW_' + RowNumber,'HMI_ROW_BOT_MAX','HMI_ROW_BOT');
		} else {
			classReplace(FurnaceID + '_HMI_CONTROLS_ROW_' + RowNumber,'HMI_ROW_BOT','HMI_ROW_BOT_MAX');
		};
	}

	function ToggleMaxWrapper(FurnaceID,ElementName){
		if(TopMaximised){
			classReplace(FurnaceID + '_HMI_CONTROLS_' + ElementName + 'TEMP_LABEL','HMI_BLOCK_MAX','HMI_BLOCK');
			classReplace(FurnaceID + '_HMI_CONTROLS_' + ElementName + 'TEMP','HMI_DATA_MAX','HMI_DATA');
			classReplace(FurnaceID + '_' + ElementName + 'TEMP_WRAPPER','HMI_WRAPPER_MAX','HMI_WRAPPER');
			classReplace(FurnaceID + '_' + ElementName + '_WRAPPER','HMI_SECTION_WRAPPER_MAX','HMI_SECTION_WRAPPER');
		}else{
			classReplace(FurnaceID + '_HMI_CONTROLS_' + ElementName + 'TEMP_LABEL','HMI_BLOCK','HMI_BLOCK_MAX');
			classReplace(FurnaceID + '_HMI_CONTROLS_' + ElementName + 'TEMP','HMI_DATA','HMI_DATA_MAX');
			classReplace(FurnaceID + '_' + ElementName + 'TEMP_WRAPPER','HMI_WRAPPER','HMI_WRAPPER_MAX');
			classReplace(FurnaceID + '_' + ElementName + '_WRAPPER','HMI_SECTION_WRAPPER','HMI_SECTION_WRAPPER_MAX');
		};
	}

	function ToggleMax(FurnaceID,ElementName){
		if(TopMaximised){
			classReplace(FurnaceID + '_HMI_CONTROLS_' + ElementName + '_LABEL','HMI_BLOCK_MAX','HMI_BLOCK');
			classReplace(FurnaceID + '_HMI_CONTROLS_' + ElementName,'HMI_DATA_MAX','HMI_DATA');
		}else{
			classReplace(FurnaceID + '_HMI_CONTROLS_' + ElementName + '_LABEL','HMI_BLOCK','HMI_BLOCK_MAX');
			classReplace(FurnaceID + '_HMI_CONTROLS_' + ElementName,'HMI_DATA','HMI_DATA_MAX');
		};
	}

	function classReplace(ElementID,OldClass,NewClass){
		var ElementDiv = document.getElementById(ElementID);
		var ElementFound = false;
		ElementDiv.classList.forEach(function (item){
			if(item == OldClass){ElementFound = true;};
		});
		if(ElementFound){
			ElementDiv.classList.remove(OldClass);
			ElementDiv.classList.add(NewClass);
		};
	}

	function createTopControls(ParentDivName,FurnaceID,IncludeDips){
		var ParentDiv = document.getElementById(ParentDivName);
		var HMI_CONTROLS_ROW_1 = document.createElement("div");
		var HMI_CONTROLS_ROW_2 = document.createElement("div");
		var HMI_CONTROLS_ZINC_WRAPPER = document.createElement("div");
		var HMI_CONTROLS_FLUE_WRAPPER = document.createElement("div");
		var HMI_CONTROLS_ZINCTEMP_WRAPPER = document.createElement("div");
		var HMI_CONTROLS_FLUETEMP_WRAPPER = document.createElement("div");
		var HMI_CONTROLS_ZINCSP_WRAPPER = document.createElement("div");
		var HMI_CONTROLS_FLUESP_WRAPPER = document.createElement("div");
		var HMI_CONTROLS_OUTPUT_WRAPPER = document.createElement("div");
		var HMI_CONTROLS_GASFLOW_WRAPPER = document.createElement("div");
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
		HMI_CONTROLS_ZINC_WRAPPER.setAttribute('id',FurnaceID + '_ZINC_WRAPPER');
		HMI_CONTROLS_ZINC_WRAPPER.setAttribute('class','HMI_SECTION_WRAPPER');
		HMI_CONTROLS_FLUE_WRAPPER.setAttribute('id',FurnaceID + '_FLUE_WRAPPER');
		HMI_CONTROLS_FLUE_WRAPPER.setAttribute('class','HMI_SECTION_WRAPPER');
		HMI_CONTROLS_ZINCTEMP_WRAPPER.setAttribute('id',FurnaceID + '_ZINCTEMP_WRAPPER');
		HMI_CONTROLS_ZINCTEMP_WRAPPER.setAttribute('class','HMI_WRAPPER');
		HMI_CONTROLS_FLUETEMP_WRAPPER.setAttribute('id',FurnaceID + '_FLUETEMP_WRAPPER');
		HMI_CONTROLS_FLUETEMP_WRAPPER.setAttribute('class','HMI_WRAPPER');
		HMI_CONTROLS_ZINCSP_WRAPPER.setAttribute('id',FurnaceID + '_ZINCSP_WRAPPER');
		HMI_CONTROLS_ZINCSP_WRAPPER.setAttribute('class','HMI_WRAPPER');
		HMI_CONTROLS_FLUESP_WRAPPER.setAttribute('id',FurnaceID + '_FLUESP_WRAPPER');
		HMI_CONTROLS_FLUESP_WRAPPER.setAttribute('class','HMI_WRAPPER');
		HMI_CONTROLS_OUTPUT_WRAPPER.setAttribute('id',FurnaceID + '_OUTPUT_WRAPPER');
		HMI_CONTROLS_OUTPUT_WRAPPER.setAttribute('class','HMI_WRAPPER');
		HMI_CONTROLS_GASFLOW_WRAPPER.setAttribute('id',FurnaceID + '_GASFLOW_WRAPPER');
		HMI_CONTROLS_GASFLOW_WRAPPER.setAttribute('class','HMI_WRAPPER');
		HMI_CONTROLS_ROW_1.setAttribute('id',FurnaceID + '_HMI_CONTROLS_ROW_1');
		HMI_CONTROLS_ROW_1.setAttribute('class','HMI_ROW_TOP');
		HMI_CONTROLS_ROW_2.setAttribute('id',FurnaceID + '_HMI_CONTROLS_ROW_2');
		HMI_CONTROLS_ROW_2.setAttribute('class','HMI_ROW_BOT');
		HMI_CONTROLS_ZINCTEMP_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_ZINCTEMP_LABEL');
		HMI_CONTROLS_ZINCTEMP_LABEL.setAttribute('class','HMI_BLOCK HMI_CONT_PV');
		HMI_CONTROLS_ZINCTEMP.setAttribute('id',FurnaceID + '_HMI_CONTROLS_ZINCTEMP');
		HMI_CONTROLS_ZINCTEMP.setAttribute('class','HMI_DATA HMI_CONT_DATA');
		HMI_CONTROLS_FLUETEMP_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_FLUETEMP_LABEL');
		HMI_CONTROLS_FLUETEMP_LABEL.setAttribute('class','HMI_BLOCK HMI_CONT_PV');
		HMI_CONTROLS_FLUETEMP.setAttribute('id',FurnaceID + '_HMI_CONTROLS_FLUETEMP');
		HMI_CONTROLS_FLUETEMP.setAttribute('class','HMI_DATA HMI_CONT_DATA');
		HMI_CONTROLS_ZINCSP_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_ZINCSP_LABEL');
		HMI_CONTROLS_ZINCSP_LABEL.setAttribute('class','HMI_BLOCK HMI_CONT_SP');
		HMI_CONTROLS_ZINCSP.setAttribute('id',FurnaceID + '_HMI_CONTROLS_ZINCSP');
		HMI_CONTROLS_ZINCSP.setAttribute('class','HMI_DATA HMI_CONT_DATA');
		HMI_CONTROLS_FLUESP_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_FLUESP_LABEL');
		HMI_CONTROLS_FLUESP_LABEL.setAttribute('class','HMI_BLOCK HMI_CONT_SP');
		HMI_CONTROLS_FLUESP.setAttribute('id',FurnaceID + '_HMI_CONTROLS_FLUESP');
		HMI_CONTROLS_FLUESP.setAttribute('class','HMI_DATA HMI_CONT_DATA');
		HMI_CONTROLS_OUTPUT_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_OUTPUT_LABEL');
		HMI_CONTROLS_OUTPUT_LABEL.setAttribute('class','HMI_BLOCK HMI_CONT_OUTPUT');
		HMI_CONTROLS_OUTPUT.setAttribute('id',FurnaceID + '_HMI_CONTROLS_OUTPUT');
		HMI_CONTROLS_OUTPUT.setAttribute('class','HMI_DATA HMI_CONT_DATA');
		HMI_CONTROLS_GASFLOW_LABEL.setAttribute('id',FurnaceID + '_HMI_CONTROLS_GASFLOW_LABEL');
		HMI_CONTROLS_GASFLOW_LABEL.setAttribute('class','HMI_BLOCK HMI_CONT_GASFLOW');
		HMI_CONTROLS_GASFLOW.setAttribute('id',FurnaceID + '_HMI_CONTROLS_GASFLOW');
		HMI_CONTROLS_GASFLOW.setAttribute('class','HMI_DATA HMI_CONT_DATA');
		HMI_CONTROLS_ROW_1.appendChild(HMI_CONTROLS_ZINC_WRAPPER);
		HMI_CONTROLS_ROW_1.appendChild(HMI_CONTROLS_FLUE_WRAPPER);
		HMI_CONTROLS_ZINC_WRAPPER.appendChild(HMI_CONTROLS_ZINCTEMP_WRAPPER);
		HMI_CONTROLS_FLUE_WRAPPER.appendChild(HMI_CONTROLS_FLUETEMP_WRAPPER);
		HMI_CONTROLS_ZINCTEMP_WRAPPER.appendChild(HMI_CONTROLS_ZINCTEMP_LABEL);
		HMI_CONTROLS_ZINCTEMP_WRAPPER.appendChild(HMI_CONTROLS_ZINCTEMP);
		HMI_CONTROLS_FLUETEMP_WRAPPER.appendChild(HMI_CONTROLS_FLUETEMP_LABEL);
		HMI_CONTROLS_FLUETEMP_WRAPPER.appendChild(HMI_CONTROLS_FLUETEMP);
		HMI_CONTROLS_ZINC_WRAPPER.appendChild(HMI_CONTROLS_ZINCSP_WRAPPER);
		HMI_CONTROLS_FLUE_WRAPPER.appendChild(HMI_CONTROLS_FLUESP_WRAPPER);
		HMI_CONTROLS_ZINCSP_WRAPPER.appendChild(HMI_CONTROLS_ZINCSP_LABEL);
		HMI_CONTROLS_ZINCSP_WRAPPER.appendChild(HMI_CONTROLS_ZINCSP);
		HMI_CONTROLS_FLUESP_WRAPPER.appendChild(HMI_CONTROLS_FLUESP_LABEL);
		HMI_CONTROLS_FLUESP_WRAPPER.appendChild(HMI_CONTROLS_FLUESP);
		HMI_CONTROLS_ROW_2.appendChild(HMI_CONTROLS_OUTPUT_WRAPPER);
		HMI_CONTROLS_ROW_2.appendChild(HMI_CONTROLS_GASFLOW_WRAPPER);
		HMI_CONTROLS_OUTPUT_WRAPPER.appendChild(HMI_CONTROLS_OUTPUT_LABEL);
		HMI_CONTROLS_OUTPUT_WRAPPER.appendChild(HMI_CONTROLS_OUTPUT);
		HMI_CONTROLS_GASFLOW_WRAPPER.appendChild(HMI_CONTROLS_GASFLOW_LABEL);
		HMI_CONTROLS_GASFLOW_WRAPPER.appendChild(HMI_CONTROLS_GASFLOW);
		ParentDiv.appendChild(HMI_CONTROLS_ROW_1);
		ParentDiv.appendChild(HMI_CONTROLS_ROW_2);
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
		var HMI_SECTION_MIDDLE_TOP_BACK = document.createElement("div");
		var HMI_SECTION_MIDDLE_TOP_BACK_MIDDLE = document.createElement("div");
		var HMI_SECTION_MIDDLE_TOP_BACK_TEXT = document.createElement("div");
		var HMI_SECTION_MIDDLE_TOP_LEFT = document.createElement("div");
		var HMI_SECTION_MIDDLE_TOP_RIGHT = document.createElement("div");
		var HMI_SECTION_MIDDLE_BOT = document.createElement("div");
		var HMI_SECTION_MIDDLE_BOT_LEFT = document.createElement("div");
		var HMI_SECTION_MIDDLE_BOT_RIGHT = document.createElement("div");
		var HMI_SECTION_RIGHT = document.createElement("div");
		var HMI_SECTION_RIGHT_TOP = document.createElement("div");
		var HMI_SECTION_RIGHT_BOT = document.createElement("div");
		var GROUP_GAS_5_LEFT = document.createElement("div");
		var GROUP_GAS_5_RIGHT = document.createElement("div");
		var GROUP_GAS_6_BOTTOM = document.createElement("div");
		var GROUP_AIR_4_LEFT = document.createElement("div");
		var GROUP_AIR_4_RIGHT = document.createElement("div");
		var GROUP_AIR_5_BOTTOM_LEFT = document.createElement("div");
		var GROUP_AIR_5_BOTTOM_RIGHT = document.createElement("div");
		HMI_SECTION_LEFT.appendChild(GROUP_GAS_5_LEFT);
		HMI_SECTION_LEFT.appendChild(GROUP_AIR_4_LEFT);
		HMI_SECTION_LEFT.appendChild(HMI_SECTION_LEFT_TOP);
		HMI_SECTION_LEFT.appendChild(HMI_SECTION_LEFT_BOT);
		HMI_SECTION_MIDDLE.appendChild(HMI_SECTION_MIDDLE_TOP);
		HMI_SECTION_MIDDLE.appendChild(HMI_SECTION_MIDDLE_BOT);
		HMI_SECTION_MIDDLE_TOP.appendChild(HMI_SECTION_MIDDLE_TOP_LEFT);
		HMI_SECTION_MIDDLE_TOP.appendChild(HMI_SECTION_MIDDLE_TOP_RIGHT);
		HMI_SECTION_MIDDLE_BOT.appendChild(HMI_SECTION_MIDDLE_BOT_LEFT);
		HMI_SECTION_MIDDLE_BOT.appendChild(HMI_SECTION_MIDDLE_BOT_RIGHT);
		HMI_SECTION_RIGHT.appendChild(GROUP_GAS_5_RIGHT);
		HMI_SECTION_RIGHT.appendChild(GROUP_AIR_4_RIGHT);
		HMI_SECTION_RIGHT.appendChild(HMI_SECTION_RIGHT_TOP);
		HMI_SECTION_RIGHT.appendChild(HMI_SECTION_RIGHT_BOT);
		HMI_SECTION_LEFT.setAttribute('id',FurnaceID + '_HMI_SECTION_LEFT');
		HMI_SECTION_LEFT.setAttribute('class','HMI_SECTION HMI_SIDE');
		HMI_SECTION_LEFT_TOP.setAttribute('id',FurnaceID + '_HMI_SECTION_LEFT_TOP');
		HMI_SECTION_LEFT_TOP.setAttribute('class','HMI_SECTION HMI_TOP');
		HMI_SECTION_LEFT_BOT.setAttribute('id',FurnaceID + '_HMI_SECTION_LEFT_BOT');
		HMI_SECTION_LEFT_BOT.setAttribute('class','HMI_SECTION HMI_BOT');
		GROUP_GAS_5_LEFT.setAttribute('id',FurnaceID + '_GROUP_GAS_5_LEFT');
		GROUP_GAS_5_LEFT.setAttribute('class','GROUP_GAS_5');
		GROUP_GAS_5_LEFT.setAttribute('style','right:unset;');
		GROUP_AIR_4_LEFT.setAttribute('id',FurnaceID + '_GROUP_AIR_4_LEFT');
		GROUP_AIR_4_LEFT.setAttribute('class','GROUP_AIR_4');
		GROUP_AIR_4_LEFT.setAttribute('style','right:unset;');
		HMI_SECTION_MIDDLE.setAttribute('id',FurnaceID + '_HMI_SECTION_MIDDLE');
		HMI_SECTION_MIDDLE.setAttribute('class','HMI_SECTION HMI_MIDDLE');
		HMI_SECTION_MIDDLE_TOP.setAttribute('id',FurnaceID + '_HMI_SECTION_MIDDLE_TOP');
		HMI_SECTION_MIDDLE_TOP.setAttribute('class','HMI_SECTION HMI_TOP');
		HMI_SECTION_MIDDLE_TOP.setAttribute('style','flex-direction: row;');
		HMI_SECTION_MIDDLE_TOP_BACK.setAttribute('id',FurnaceID + '_HMI_SECTION_MIDDLE_TOP_BACK');
		HMI_SECTION_MIDDLE_TOP_BACK.setAttribute('class','HMI_TOP_BACK');
		HMI_SECTION_MIDDLE_TOP_BACK_MIDDLE.setAttribute('id',FurnaceID + '_HMI_SECTION_MIDDLE_TOP_BACK_MIDDLE');
		HMI_SECTION_MIDDLE_TOP_BACK_MIDDLE.setAttribute('class','HMI_TOP_BACK_MIDDLE');
		HMI_SECTION_MIDDLE_TOP_BACK_TEXT.setAttribute('id',FurnaceID + '_HMI_SECTION_MIDDLE_TOP_BACK_TEXT');
		HMI_SECTION_MIDDLE_TOP_BACK_TEXT.setAttribute('class','HMI_TOP_BACK_TEXT');
		HMI_SECTION_MIDDLE_TOP_LEFT.setAttribute('id',FurnaceID + '_HMI_SECTION_MIDDLE_TOP_LEFT');
		HMI_SECTION_MIDDLE_TOP_LEFT.setAttribute('class','HMI_SECTION HMI_TOP_LEFT');
		HMI_SECTION_MIDDLE_TOP_RIGHT.setAttribute('id',FurnaceID + '_HMI_SECTION_MIDDLE_TOP_RIGHT');
		HMI_SECTION_MIDDLE_TOP_RIGHT.setAttribute('class','HMI_SECTION HMI_TOP_RIGHT');
		HMI_SECTION_MIDDLE_BOT.setAttribute('id',FurnaceID + '_HMI_SECTION_MIDDLE_BOT');
		HMI_SECTION_MIDDLE_BOT.setAttribute('class','HMI_SECTION HMI_BOT');
		HMI_SECTION_MIDDLE_BOT.setAttribute('style','flex-direction: row;');
		HMI_SECTION_MIDDLE_BOT_LEFT.setAttribute('id',FurnaceID + '_HMI_SECTION_MIDDLE_BOT_LEFT');
		HMI_SECTION_MIDDLE_BOT_LEFT.setAttribute('class','HMI_MIDDLE_BOT_LEFT');
		HMI_SECTION_MIDDLE_BOT_RIGHT.setAttribute('id',FurnaceID + '_HMI_SECTION_MIDDLE_BOT_RIGHT');
		HMI_SECTION_MIDDLE_BOT_RIGHT.setAttribute('class','HMI_MIDDLE_BOT_RIGHT');
		HMI_SECTION_RIGHT.setAttribute('id',FurnaceID + '_HMI_SECTION_RIGHT');
		HMI_SECTION_RIGHT.setAttribute('class','HMI_SECTION HMI_SIDE');
		HMI_SECTION_RIGHT_TOP.setAttribute('id',FurnaceID + '_HMI_SECTION_RIGHT_TOP');
		HMI_SECTION_RIGHT_TOP.setAttribute('class','HMI_SECTION HMI_TOP');
		HMI_SECTION_RIGHT_BOT.setAttribute('id',FurnaceID + '_HMI_SECTION_RIGHT_BOT');
		HMI_SECTION_RIGHT_BOT.setAttribute('class','HMI_SECTION HMI_BOT');
		GROUP_GAS_5_RIGHT.setAttribute('id',FurnaceID + '_GROUP_GAS_5_RIGHT');
		GROUP_GAS_5_RIGHT.setAttribute('class','GROUP_GAS_5');
		GROUP_GAS_5_RIGHT.setAttribute('style','left:unset;');
		GROUP_AIR_4_RIGHT.setAttribute('id',FurnaceID + '_GROUP_AIR_4_RIGHT');
		GROUP_AIR_4_RIGHT.setAttribute('class','GROUP_AIR_4');
		GROUP_AIR_4_RIGHT.setAttribute('style','left:unset;');
		GROUP_GAS_6_BOTTOM.setAttribute('id',FurnaceID + '_GROUP_GAS_6_BOTTOM');
		GROUP_GAS_6_BOTTOM.setAttribute('class','GROUP_GAS_6_BOTTOM');
		GROUP_AIR_5_BOTTOM_LEFT.setAttribute('id',FurnaceID + '_GROUP_AIR_5_BOTTOM_LEFT');
		GROUP_AIR_5_BOTTOM_LEFT.setAttribute('class','GROUP_AIR_5_BOTTOM_LEFT');
		GROUP_AIR_5_BOTTOM_RIGHT.setAttribute('id',FurnaceID + '_GROUP_AIR_5_BOTTOM_RIGHT');
		GROUP_AIR_5_BOTTOM_RIGHT.setAttribute('class','GROUP_AIR_5_BOTTOM_RIGHT');
		ParentDiv.appendChild(GROUP_GAS_6_BOTTOM);
		ParentDiv.appendChild(GROUP_AIR_5_BOTTOM_LEFT);
		ParentDiv.appendChild(GROUP_AIR_5_BOTTOM_RIGHT);
		ParentDiv.appendChild(HMI_SECTION_LEFT);
		ParentDiv.appendChild(HMI_SECTION_MIDDLE);
		ParentDiv.appendChild(HMI_SECTION_RIGHT);
		createFanGroup(FurnaceID,FurnaceID + '_HMI_SECTION_MIDDLE_BOT_LEFT',1);
		createFanGroup(FurnaceID,FurnaceID + '_HMI_SECTION_MIDDLE_BOT_RIGHT',2);
		createPressureSwitches(1,BurnerCount);
		createPressureSwitches(2,BurnerCount);
		for(var i=0;i<(BurnerCount/2);i++){
			var HeightVal = 90/(BurnerCount/2);
			var HeightVal2 = HeightVal/2;
			var HeightVal3 = HeightVal2;
			var BurnerNum = i+1;
			var BurnerCalc = BurnerCount/4;
			var BackWrapper = false;
			if(i==0){
				createBurnerGroupSpacer(FurnaceID,0,0,false);
				createFlameGroupSpacer(FurnaceID,0,0,false);
				};
			if(i==BurnerCalc){
				switch (BurnerCount/2){
					case 12:
						createBurnerGroupSpacer(FurnaceID,HeightVal,0,true);
						HeightVal3 = HeightVal2 + 5;
						BackWrapper = true;
						break;
					case 8:
						createBurnerGroupSpacer(FurnaceID,HeightVal,0,true);  // was 2
						HeightVal3 = HeightVal2 + 5;
						BackWrapper = true;
						break;
					case 4:
						createBurnerGroupSpacer(FurnaceID,HeightVal,0,true);  // was 4
						HeightVal3 = HeightVal2 + 5;
						BackWrapper = true;
						break;
				};
			}	;		
			createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_LEFT_TOP','A' + BurnerNum,'100%',HeightVal + '%',false)
			createBurnerGroup(FurnaceID,FurnaceID + '_HMI_SECTION_RIGHT_TOP','B' + BurnerNum,'100%',HeightVal + '%',true)
			createFlameGroup(FurnaceID,FurnaceID + '_HMI_SECTION_MIDDLE_TOP_LEFT','A' + BurnerNum,'100%',HeightVal3 + '%',HeightVal2 + '%',false,BackWrapper)
			createFlameGroup(FurnaceID,FurnaceID + '_HMI_SECTION_MIDDLE_TOP_RIGHT','B' + BurnerNum,'100%',HeightVal3 + '%',HeightVal2 + '%',true,false)
		};
		var BACK_WRAPPER = document.getElementById(FurnaceID + '_BACK_WRAPPER');
		BACK_WRAPPER.appendChild(HMI_SECTION_MIDDLE_TOP_BACK);
		HMI_SECTION_MIDDLE_TOP_BACK.appendChild(HMI_SECTION_MIDDLE_TOP_BACK_MIDDLE);
		HMI_SECTION_MIDDLE_TOP_BACK_MIDDLE.appendChild(HMI_SECTION_MIDDLE_TOP_BACK_TEXT);
		
	}

	function createPressureSwitches(ID,BurnerCount){
		var FAN_BOX_LEFT_TOP = document.getElementById('FAN_' + ID + '_BOX_LEFT_TOP');
		var FAN_BOX_LEFT_MID = document.getElementById('FAN_' + ID + '_BOX_LEFT_MID');
		var FAN_BOX_LEFT_BOT = document.getElementById('FAN_' + ID + '_BOX_LEFT_BOT');
		var PRESS_MAIN = document.createElement('div');
		var PRESS_1 = document.createElement('div');
		var PRESS_2 = document.createElement('div');
		var PRESS_3 = document.createElement('div');
		var PRESS_4 = document.createElement('div');
		var PRESS_5 = document.createElement('div');
		var PRESS_6 = document.createElement('div');
		
		PRESS_MAIN.setAttribute('id','PRESS_' + ID + '_MAIN');
		PRESS_MAIN.setAttribute('class','PRESS_BOX');
		PRESS_1.setAttribute('id','PRESS_' + ID + '_1');
		PRESS_1.setAttribute('class','PRESS_BOX');
		PRESS_2.setAttribute('id','PRESS_' + ID + '_2');
		PRESS_2.setAttribute('class','PRESS_BOX');
		PRESS_3.setAttribute('id','PRESS_' + ID + '_3');
		PRESS_3.setAttribute('class','PRESS_BOX');
		PRESS_4.setAttribute('id','PRESS_' + ID + '_4');
		PRESS_4.setAttribute('class','PRESS_BOX');
		PRESS_5.setAttribute('id','PRESS_' + ID + '_5');
		PRESS_5.setAttribute('class','PRESS_BOX');
		PRESS_6.setAttribute('id','PRESS_' + ID + '_6');
		PRESS_6.setAttribute('class','PRESS_BOX');
		
		switch(BurnerCount) {
			case 4:
				FAN_BOX_LEFT_TOP.appendChild(PRESS_1);
				FAN_BOX_LEFT_MID.appendChild(PRESS_MAIN);
				FAN_BOX_LEFT_BOT.appendChild(PRESS_2);
				document.getElementById('PRESS_' + ID + '_MAIN').innerText = 'A';
				document.getElementById('PRESS_' + ID + '_1').innerText = '1';
				document.getElementById('PRESS_' + ID + '_2').innerText = '2';
				break;
			case 6:
				FAN_BOX_LEFT_TOP.appendChild(PRESS_1);
				FAN_BOX_LEFT_MID.appendChild(PRESS_2);
				FAN_BOX_LEFT_MID.appendChild(PRESS_MAIN);
				FAN_BOX_LEFT_BOT.appendChild(PRESS_3);
				document.getElementById('PRESS_' + ID + '_MAIN').innerText = 'A';
				document.getElementById('PRESS_' + ID + '_1').innerText = '1';
				document.getElementById('PRESS_' + ID + '_2').innerText = '2';
				document.getElementById('PRESS_' + ID + '_3').innerText = '3';
				break;
			case 8:
				FAN_BOX_LEFT_TOP.appendChild(PRESS_1);
				FAN_BOX_LEFT_TOP.appendChild(PRESS_2);
				FAN_BOX_LEFT_MID.appendChild(PRESS_MAIN);
				FAN_BOX_LEFT_BOT.appendChild(PRESS_3);
				FAN_BOX_LEFT_BOT.appendChild(PRESS_4);
				document.getElementById('PRESS_' + ID + '_MAIN').innerText = 'A';
				document.getElementById('PRESS_' + ID + '_1').innerText = '1';
				document.getElementById('PRESS_' + ID + '_2').innerText = '2';
				document.getElementById('PRESS_' + ID + '_3').innerText = '3';
				document.getElementById('PRESS_' + ID + '_4').innerText = '4';
				break;
			case 12:
				FAN_BOX_LEFT_TOP.appendChild(PRESS_1);
				FAN_BOX_LEFT_TOP.appendChild(PRESS_2);
				FAN_BOX_LEFT_TOP.appendChild(PRESS_3);
				FAN_BOX_LEFT_MID.appendChild(PRESS_MAIN);
				FAN_BOX_LEFT_BOT.appendChild(PRESS_4);
				FAN_BOX_LEFT_BOT.appendChild(PRESS_5);
				FAN_BOX_LEFT_BOT.appendChild(PRESS_6);
				document.getElementById('PRESS_' + ID + '_MAIN').innerText = 'A';
				document.getElementById('PRESS_' + ID + '_1').innerText = '1';
				document.getElementById('PRESS_' + ID + '_2').innerText = '2';
				document.getElementById('PRESS_' + ID + '_3').innerText = '3';
				document.getElementById('PRESS_' + ID + '_4').innerText = '4';
				document.getElementById('PRESS_' + ID + '_5').innerText = '5';
				document.getElementById('PRESS_' + ID + '_6').innerText = '6';
				break;
		};
	}

	function createFanGroup(FurnaceID,ParentDivName,ID){
		var ParentDiv = document.getElementById(ParentDivName);
		var FAN_BOX = document.createElement('div');
		var FAN_BOX_LEFT = document.createElement('div');
		var FAN_BOX_LEFT_TOP = document.createElement('div');
		var FAN_BOX_LEFT_MID = document.createElement('div');
		var FAN_BOX_LEFT_BOT = document.createElement('div');
		var FAN_BOX_RIGHT = document.createElement('div');
		var FAN_BOX_RIGHT_TOP = document.createElement('div');
		var FAN_BOX_RIGHT_BOT = document.createElement('div');
		var FAN_BLADE = document.createElement('img');
		var FAN_COVER = document.createElement('img');
		var FAN_AIR_1 = document.createElement('div');
		var FAN_AIR_2 = document.createElement('div');
		var FAN_AIR_3 = document.createElement('div');
		//var PURGE_BOX = document.createElement('div');
		
		FAN_BOX.setAttribute('id','FAN_' + ID + '_BOX');
		FAN_BOX.setAttribute('class','FAN_BOX');
		FAN_BOX_LEFT.setAttribute('id','FAN_' + ID + '_BOX_LEFT');
		FAN_BOX_LEFT.setAttribute('class','FAN_BOX_LEFT');
		
		FAN_AIR_1.setAttribute('id','FAN_' + ID + '_AIR_1');
		FAN_AIR_1.setAttribute('class','FAN_AIR_1');
		FAN_AIR_2.setAttribute('id','FAN_' + ID + '_AIR_2');
		FAN_AIR_2.setAttribute('class','FAN_AIR_2');
		FAN_AIR_3.setAttribute('id','FAN_' + ID + '_AIR_3');
		FAN_AIR_3.setAttribute('class','FAN_AIR_3');
		if(ID == 1){
			FAN_AIR_3.setAttribute('style','left:unset;');
		}else{
			FAN_AIR_3.setAttribute('style','right:unset;');
		}
		
		FAN_BOX_LEFT_TOP.setAttribute('id','FAN_' + ID + '_BOX_LEFT_TOP');
		FAN_BOX_LEFT_TOP.setAttribute('class','FAN_BOX_LEFT_TOP');
		FAN_BOX_LEFT_MID.setAttribute('id','FAN_' + ID + '_BOX_LEFT_MID');
		FAN_BOX_LEFT_MID.setAttribute('class','FAN_BOX_LEFT_MID');
		FAN_BOX_LEFT_BOT.setAttribute('id','FAN_' + ID + '_BOX_LEFT_BOT');
		FAN_BOX_LEFT_BOT.setAttribute('class','FAN_BOX_LEFT_BOT');
		
		FAN_BOX_RIGHT.setAttribute('id','FAN_' + ID + '_BOX_RIGHT');
		FAN_BOX_RIGHT.setAttribute('class','FAN_BOX_RIGHT');
		FAN_BOX_RIGHT_TOP.setAttribute('id','FAN_' + ID + '_BOX_RIGHT_TOP');
		FAN_BOX_RIGHT_TOP.setAttribute('class','FAN_BOX_RIGHT_TOP');
		FAN_BOX_RIGHT_BOT.setAttribute('id','FAN_' + ID + '_BOX_RIGHT_BOT');
		FAN_BOX_RIGHT_BOT.setAttribute('class','FAN_BOX_RIGHT_BOT');
		
		FAN_BLADE.setAttribute('id',FurnaceID + '_FAN_BLADE_' + ID);
		FAN_BLADE.setAttribute('src',getFanSvg());
		FAN_BLADE.setAttribute('alt','Fan ' + ID);
		FAN_BLADE.setAttribute('class','fan fan' + ID);
		
		FAN_COVER.setAttribute('id',FurnaceID + '_FAN_COVER_' + ID);
		FAN_COVER.setAttribute('src',getPipeSvg());
		FAN_COVER.setAttribute('alt','Fan Ring ' + ID);
		FAN_COVER.setAttribute('class','Ring1');
		
		//PURGE_BOX.setAttribute('id','PURGE_' + ID + '_BOX');
		//PURGE_BOX.setAttribute('class','PURGE_BOX');
		//if(ID==1){PURGE_BOX.setAttribute('style','left:unset;');};
		//if(ID==2){PURGE_BOX.setAttribute('style','right:unset;');};
		
		ParentDiv.appendChild(FAN_BOX);
		//FAN_BOX.appendChild(PURGE_BOX);
		ParentDiv.appendChild(FAN_AIR_1);
		ParentDiv.appendChild(FAN_AIR_2);
		ParentDiv.appendChild(FAN_AIR_3);
		FAN_BOX.appendChild(FAN_BOX_LEFT);
		FAN_BOX_LEFT.appendChild(FAN_BOX_LEFT_TOP);
		FAN_BOX_LEFT.appendChild(FAN_BOX_LEFT_MID);
		FAN_BOX_LEFT.appendChild(FAN_BOX_LEFT_BOT);
		FAN_BOX.appendChild(FAN_BOX_RIGHT);
		FAN_BOX_RIGHT.appendChild(FAN_BOX_RIGHT_TOP);
		FAN_BOX_RIGHT.appendChild(FAN_BOX_RIGHT_BOT);
		FAN_BOX_RIGHT_TOP.appendChild(FAN_BLADE);
		FAN_BOX_RIGHT_TOP.appendChild(FAN_COVER);
	}

	function FanColorReset(FurnaceID,ID){
		svgRESET(FurnaceID + '_FAN_BLADE_' + ID);
		svgRESET(FurnaceID + '_FAN_COVER_' + ID);
	}

	function FanColorRed(FurnaceID,ID){
		svgRED(FurnaceID + '_FAN_BLADE_' + ID);
		svgRED(FurnaceID + '_FAN_COVER_' + ID);
	}

	function svgRED(SVG_ID){
		document.getElementById(SVG_ID).style.filter = 'invert(.5) sepia(1) saturate(80) hue-rotate(360deg)';
	}

	function svgRESET(SVG_ID){
		document.getElementById(SVG_ID).style.filter = '';
	}

	function createFlameGroupSpacer(FurnaceID,HeightVal,SpacerCount){
		var LeftParentDiv = document.getElementById(FurnaceID + '_HMI_SECTION_MIDDLE_TOP_LEFT');
		var RightParentDiv = document.getElementById(FurnaceID + '_HMI_SECTION_MIDDLE_TOP_RIGHT');
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

	function createBurnerGroupSpacer(FurnaceID,HeightVal,SpacerCount,InsertPipes){
		var LeftParentDiv = document.getElementById(FurnaceID + '_HMI_SECTION_LEFT_TOP');
		var RightParentDiv = document.getElementById(FurnaceID + '_HMI_SECTION_RIGHT_TOP');
		var LeftSpacer = document.createElement("div");
		var RightSpacer = document.createElement("div");
		
		var LEFT_GAS_1 = document.createElement("div");
		var LEFT_AIR_1 = document.createElement("div");
		var RIGHT_GAS_1 = document.createElement("div");
		var RIGHT_AIR_1 = document.createElement("div");
		
		var HeightCalc = HeightVal * SpacerCount + 5;
		
		LEFT_GAS_1.setAttribute('id',FurnaceID + '_LEFT_GAS_1');
		LEFT_GAS_1.setAttribute('class','LEFT_GAS_1');
		LEFT_AIR_1.setAttribute('id',FurnaceID + '_LEFT_AIR_1');
		LEFT_AIR_1.setAttribute('class','LEFT_AIR_1');
		RIGHT_GAS_1.setAttribute('id',FurnaceID + '_RIGHT_GAS_1');
		RIGHT_GAS_1.setAttribute('class','RIGHT_GAS_1');
		RIGHT_AIR_1.setAttribute('id',FurnaceID + '_RIGHT_AIR_1');
		RIGHT_AIR_1.setAttribute('class','RIGHT_AIR_1');
		
		LeftSpacer.setAttribute('id',FurnaceID + '_LeftSpacer');
		LeftSpacer.setAttribute('class','SIDE_SPACER');
		LeftSpacer.setAttribute('style','height:' + HeightCalc + '%;');
		RightSpacer.setAttribute('id',FurnaceID + '_RightSpacer');
		RightSpacer.setAttribute('class','SIDE_SPACER');
		RightSpacer.setAttribute('style','height:' + HeightCalc + '%;');
		
		if(InsertPipes){
			LeftSpacer.appendChild(LEFT_GAS_1);
			LeftSpacer.appendChild(LEFT_AIR_1);
			RightSpacer.appendChild(RIGHT_GAS_1);
			RightSpacer.appendChild(RIGHT_AIR_1);
		}
		LeftParentDiv.appendChild(LeftSpacer);
		RightParentDiv.appendChild(RightSpacer);
	}

	function createFlameGroup(FurnaceID,ParentDivName,ID,WidthVal,HeightValTop,HeightVal,Reversed, BackWrapper){
		var ParentDiv = document.getElementById(ParentDivName);
		var TOP_DIV = document.createElement("div");
		var BOT_DIV = document.createElement("div");
		ParentDiv.appendChild(TOP_DIV);
		ParentDiv.appendChild(BOT_DIV);
		if(BackWrapper){
			TOP_DIV.setAttribute('id',FurnaceID + '_BACK_WRAPPER');
			TOP_DIV.setAttribute('class','BACK_WRAPPER');
			TOP_DIV.setAttribute('style','height: ' + HeightValTop + '; width: 200%;');
		}else{
			TOP_DIV.setAttribute('id',ParentDivName + '_TOP_' + ID);
			TOP_DIV.setAttribute('class','FLAME_SECTION');
			TOP_DIV.setAttribute('style','height: ' + HeightValTop + ';');
		};
		BOT_DIV.setAttribute('id',ParentDivName + '_BOT_' + ID);
		BOT_DIV.setAttribute('style','height: ' + HeightVal + ';z-index: 1;');
		BOT_DIV.setAttribute('class','FLAME_SECTION');
		createFlame(FurnaceID,ParentDivName + '_BOT_' + ID,ID + '_FLAME',WidthVal,HeightVal,Reversed)
	}

	function createBurnerGroup(FurnaceID,ParentDiv,ID,WidthVal,HeightVal,Reversed){
		var ParentDiv = document.getElementById(ParentDiv);
		var GROUP = document.createElement("div");
		var GROUP_C1 = document.createElement("div");
		var GROUP_C1_TOP = document.createElement("div");
		var GROUP_C1_BOT = document.createElement("div");
		var GROUP_C2 = document.createElement("div");
		var GROUP_C2_TOP = document.createElement("div");
		var GROUP_C2_BOT = document.createElement("div");
		var GROUP_C3 = document.createElement("div");
		var GROUP_C3_TOP = document.createElement("div");
		var GROUP_C3_BOT = document.createElement("div");
		var GROUP_C5 = document.createElement("div");
		var GROUP_C5_TOP = document.createElement("div");
		var GROUP_C5_BOT = document.createElement("div");
		var GROUP_LABEL = document.createElement("div");
		var GROUP_GAS_1 = document.createElement("div");
		var GROUP_GAS_2 = document.createElement("div");
		var GROUP_GAS_3 = document.createElement("div");
		var GROUP_GAS_4 = document.createElement("div");
		var GROUP_AIR_1 = document.createElement("div");
		var GROUP_AIR_2 = document.createElement("div");
		var GROUP_AIR_3 = document.createElement("div");
		
		GROUP_C1_TOP.appendChild(GROUP_GAS_1);
		GROUP_C1_TOP.appendChild(GROUP_GAS_3);
		GROUP_C5_TOP.appendChild(GROUP_GAS_2);
		GROUP_C5_TOP.appendChild(GROUP_GAS_4);
		GROUP_C1_BOT.appendChild(GROUP_AIR_1);
		GROUP_C5_BOT.appendChild(GROUP_AIR_2);
		GROUP_C1_BOT.appendChild(GROUP_AIR_3);
		if(Reversed){		
			GROUP.appendChild(GROUP_C5);
			GROUP.appendChild(GROUP_C3);
			GROUP.appendChild(GROUP_C2);
			GROUP.appendChild(GROUP_C1);
		}else{
			GROUP.appendChild(GROUP_C1);
			GROUP.appendChild(GROUP_C2);
			GROUP.appendChild(GROUP_C3);
			GROUP.appendChild(GROUP_C5);
		};
		GROUP_C1.appendChild(GROUP_C1_TOP);
		GROUP_C1.appendChild(GROUP_C1_BOT);
		GROUP_C2.appendChild(GROUP_C2_TOP);
		GROUP_C2.appendChild(GROUP_C2_BOT);
		GROUP_C3.appendChild(GROUP_C3_TOP);
		GROUP_C3.appendChild(GROUP_C3_BOT);
		GROUP_C5.appendChild(GROUP_C5_TOP);
		GROUP_C5.appendChild(GROUP_C5_BOT);
		GROUP_C5_BOT.appendChild(GROUP_LABEL);
		
		GROUP.setAttribute('id',FurnaceID + '_' + ID + '_GROUP');
		GROUP.setAttribute('style','width: ' + WidthVal + '; height: ' + HeightVal + ';');
		GROUP.setAttribute('class','BURNER_GROUP');
		GROUP_GAS_1.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_GAS_1');
		GROUP_GAS_1.setAttribute('class','GROUP_GAS_1');
		GROUP_GAS_2.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_GAS_2');
		GROUP_GAS_2.setAttribute('class','GROUP_GAS_2');
		GROUP_GAS_3.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_GAS_3');
		GROUP_GAS_3.setAttribute('class','GROUP_GAS_3');
		GROUP_GAS_4.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_GAS_4');
		GROUP_GAS_4.setAttribute('class','GROUP_GAS_4');
		GROUP_AIR_1.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_AIR_1');
		GROUP_AIR_1.setAttribute('class','GROUP_AIR_1');
		GROUP_AIR_2.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_AIR_2');
		GROUP_AIR_2.setAttribute('class','GROUP_AIR_2');
		GROUP_AIR_3.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_AIR_3');
		GROUP_AIR_3.setAttribute('class','GROUP_AIR_3');
		if(Reversed){
			GROUP_GAS_1.setAttribute('style','left:unset;');
			GROUP_GAS_2.setAttribute('style','left:unset;');
			GROUP_GAS_3.setAttribute('style','left:unset;');
			GROUP_GAS_4.setAttribute('style','right:unset;');
			GROUP_AIR_1.setAttribute('style','left:unset;');
			GROUP_AIR_2.setAttribute('style','right:unset;');
			GROUP_AIR_3.setAttribute('style','left:unset;');
		}else{
			GROUP_GAS_1.setAttribute('style','right:unset;');
			GROUP_GAS_2.setAttribute('style','right:unset;');
			GROUP_GAS_3.setAttribute('style','right:unset;');
			GROUP_GAS_4.setAttribute('style','left:unset;');
			GROUP_AIR_1.setAttribute('style','right:unset;');
			GROUP_AIR_2.setAttribute('style','left:unset;');
			GROUP_AIR_3.setAttribute('style','right:unset;');
		};
		GROUP_C1.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C1');
		GROUP_C1.setAttribute('class','GROUP_C GROUP_C1');
		GROUP_C1_TOP.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C1_TOP');
		GROUP_C1_TOP.setAttribute('class','GROUP_SECTION');
		GROUP_C1_BOT.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C1_BOT');
		GROUP_C1_BOT.setAttribute('class','GROUP_SECTION');
		GROUP_C2.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C2');
		GROUP_C2.setAttribute('class','GROUP_C GROUP_C2');
		GROUP_C2_TOP.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C2_TOP');
		GROUP_C2_TOP.setAttribute('class','GROUP_SECTION');
		GROUP_C2_BOT.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C2_BOT');
		GROUP_C2_BOT.setAttribute('class','GROUP_SECTION');
		GROUP_C3.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C3');
		GROUP_C3.setAttribute('class','GROUP_C GROUP_C3');
		GROUP_C5.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C5');
		GROUP_C5.setAttribute('class','GROUP_C GROUP_C5');
		GROUP_C3_TOP.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C3_TOP');
		GROUP_C3_TOP.setAttribute('class','GROUP_SECTION');
		GROUP_C3_BOT.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C3_BOT');
		GROUP_C3_BOT.setAttribute('class','GROUP_SECTION');
		GROUP_C5_TOP.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C5_TOP');
		GROUP_C5_TOP.setAttribute('class','GROUP_SECTION');
		GROUP_C5_BOT.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C5_BOT');
		GROUP_C5_BOT.setAttribute('class','GROUP_SECTION');
		if(Reversed){GROUP_C5_BOT.setAttribute('style','flex-direction: row-reverse;')};
		GROUP_LABEL.setAttribute('id',FurnaceID + '_' + ID + '_GROUP_C5_LABEL');
		GROUP_LABEL.setAttribute('class','GROUP_LABEL');
		ParentDiv.appendChild(GROUP);
		
		createValve(FurnaceID,FurnaceID + '_' + ID + '_GROUP_C2_TOP',ID + '_MGAS','100%','50%');
		createValve(FurnaceID,FurnaceID + '_' + ID + '_GROUP_C3_BOT',ID + '_AIR','100%','50%');
		
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
		var VALVE_BALLANCE = document.createElement("div");
		var VALVE_LEFT = document.createElement("div");
		var VALVE_RIGHT = document.createElement("div");
		var VALVE_MIDDLE = document.createElement("div");
		var VALVE_MIDDLE_TOP = document.createElement("div");
		var VALVE_MIDDLE_TOP_LEFT = document.createElement("div");
		var VALVE_MIDDLE_TOP_RIGHT = document.createElement("div");
		var VALVE_MIDDLE_MIDDLE = document.createElement("div");
		VALVE.appendChild(VALVE_TOP);
		VALVE.appendChild(VALVE_BOTTOM);
		VALVE.appendChild(VALVE_BALLANCE);
		VALVE_BOTTOM.appendChild(VALVE_LEFT);
		VALVE_BOTTOM.appendChild(VALVE_MIDDLE);
		VALVE_BOTTOM.appendChild(VALVE_RIGHT);
		VALVE_MIDDLE.appendChild(VALVE_MIDDLE_TOP);
		VALVE_MIDDLE.appendChild(VALVE_MIDDLE_MIDDLE);
		VALVE_MIDDLE_TOP.appendChild(VALVE_MIDDLE_TOP_LEFT);
		VALVE_MIDDLE_TOP.appendChild(VALVE_MIDDLE_TOP_RIGHT);
		VALVE.setAttribute('id',FurnaceID + '_' + ID);
		VALVE.setAttribute('class','VALVE');
		VALVE_TOP.setAttribute('class','VALVE_TOP');
		VALVE_BOTTOM.setAttribute('class','VALVE_BOTTOM');
		VALVE_BALLANCE.setAttribute('class','VALVE_BALLANCE');
		VALVE_LEFT.setAttribute('class','VALVE_SIDE');
		VALVE_MIDDLE.setAttribute('class','VALVE_MIDDLE');
		VALVE_RIGHT.setAttribute('class','VALVE_SIDE');
		VALVE_MIDDLE_TOP.setAttribute('class','VALVE_MIDDLE_TOP');
		VALVE_MIDDLE_TOP_LEFT.setAttribute('class','VALVE_MIDDLE_TOP_LEFT');
		VALVE_MIDDLE_TOP_RIGHT.setAttribute('class','VALVE_MIDDLE_TOP_RIGHT');
		VALVE_MIDDLE_MIDDLE.setAttribute('class','VALVE_MIDDLE_MIDDLE');
		ParentDiv.appendChild(VALVE);
	}

	function getFanSvg(){
		return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgd2lkdGg9IjEzMG1tIgogICBoZWlnaHQ9IjEzMG1tIgogICB2aWV3Qm94PSIwIDAgMTMwIDEzMCIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnNjAiCiAgIGlua3NjYXBlOnZlcnNpb249IjEuMC4yLTIgKGU4NmM4NzA4NzksIDIwMjEtMDEtMTUpIgogICBzb2RpcG9kaTpkb2NuYW1lPSJmYW4yLnN2ZyI+CiAgPGRlZnMKICAgICBpZD0iZGVmczU0IiAvPgogIDxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBpZD0iYmFzZSIKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgICAgYm9yZGVyb3BhY2l0eT0iMS4wIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiCiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTp6b29tPSIxLjE3NDkxNjgiCiAgICAgaW5rc2NhcGU6Y3g9IjIwMi44NjA4NSIKICAgICBpbmtzY2FwZTpjeT0iMzAxLjIzMTg4IgogICAgIGlua3NjYXBlOmRvY3VtZW50LXVuaXRzPSJtbSIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJsYXllcjEiCiAgICAgaW5rc2NhcGU6ZG9jdW1lbnQtcm90YXRpb249IjAiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTQ0MCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI4MzciCiAgICAgaW5rc2NhcGU6d2luZG93LXg9Ii04IgogICAgIGlua3NjYXBlOndpbmRvdy15PSItOCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIiAvPgogIDxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTU3Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZSAvPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIGlua3NjYXBlOmxhYmVsPSJMYXllciAxIgogICAgIGlua3NjYXBlOmdyb3VwbW9kZT0ibGF5ZXIiCiAgICAgaWQ9ImxheWVyMSI+CiAgICA8cGF0aAogICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgIGlkPSJwYXRoNCIKICAgICAgIGQ9Im0gMTExLjUxMjc3LDU1LjQyNTQ3NiBjIC0wLjI2Mjk2LC0xLjI3NzY1IC0wLjgxMTE5LC0yLjE4OTMyIC0xLjgxNjk1LC0zLjAyMDA1IC04LjAzNzU5LC02LjY0MjUyIC0xOS4xODQyMiwtNi4xOTYwMyAtMzMuNDQwMzI3LDEuMzM5MjQgLTAuOTMwMzU2LC0wLjkzMDM2IC0xLjkzNzM5LC0xLjcxNjcgLTMuMDY1OTI1LC0yLjM5Mzg3IDkuODI1NDQ0LC04LjgxNDgzIDE4Ljc4MTkyMiwtMTIuNTE1NDYgMjYuODY4NzkyLC0xMS4xMDI1IDIuMzg0MywwLjQxNjU0IDQuMDM1MzYsLTIuMzE1NDkgMi41NTgwNSwtNC4yMzI0OSAtMy4yNzg5NywtNC4yNTU2NiAtNy4wMTA4LC03LjcyMDUxIC0xMS40OTczMiwtMTAuNjc1NTcgLTEuMDg5NjcsLTAuNzE3NTIgLTIuMTIxNzY2LC0wLjk3NDExIC0zLjQyMDQzOSwtMC44NTA3IC0xMC4zODAyNTksMC45ODY2NSAtMTcuOTQ2NTEyLDkuMTg0MjIgLTIyLjY5ODc1OCwyNC41OTI5MiAtMS4zMTU4NzksMCAtMi41ODM5NjYsMC4xNTU5MiAtMy44NjA1NSwwLjQ3NTE3IDAuNzE0NzU5LC0xMy4xODA1MiA0LjQzMDg3MSwtMjIuMTMwNDUgMTEuMTQ4NTQ2LC0yNi44NDk3OSAxLjk4MDUwOSwtMS4zOTEyOSAxLjIxNjA0NywtNC40OTA1OCAtMS4xODM5NzMsLTQuODAxOTcgLTUuMzI3ODc3LC0wLjY5MDU1IC0xMC40MTY1ODEsLTAuNTAxOTMgLTE1LjY3ODYxMSwwLjU4MTM3IC0xLjI3NzY0NiwwLjI2Mjk2IC0yLjE4OTMwOSwwLjgxMTE5IC0zLjAyMDA0NCwxLjgxNjk2IC02LjY0MjQ4MSw4LjAzNzYyIC02LjE5NTk5NiwxOS4xODQzMSAxLjMzOTI0NCwzMy40NDA0NyAtMC45MzAzNTUsMC45MzAzNiAtMS43MTY2OTYsMS45Mzc0IC0yLjM5Mzg1OSwzLjA2NTk0IC04LjgxNDc5NywtOS44MjU0OSAtMTIuNTE1NDAzLC0xOC43ODIgLTExLjEwMjQ1MiwtMjYuODY4OTEgMC40MTY1MzUsLTIuMzg0MzEgLTIuMzE1NDgxLC00LjAzNTM4IC00LjIzMjQ3OSwtMi41NTgyNyAtNC4yNTU2MzMsMy4yNzg5OCAtNy43MjA0NjMsNy4wMTA4MyAtMTAuNjc1NTA5LDExLjQ5NzM3IC0wLjcxNzUyMSwxLjA4OTY3IC0wLjk3NDExMiwyLjEyMTc3IC0wLjg1MDcwMiwzLjQyMDQ1IDAuOTg2NjQ0LDEwLjM4MDMgOS4xODQxNzksMTcuOTQ2NiAyNC41OTI4MTcsMjIuNjk4ODYgMCwxLjMxNTg4IDAuMTU1OTA5LDIuNTgzOTggMC40NzUxNjEsMy44NjA1NyAtMTMuMTgwNDU4LC0wLjcxNDc2IC0yMi4xMzAzNDksLTQuNDMwOSAtMjYuODQ5NjcyLC0xMS4xNDg2IC0xLjM5MTI4NSwtMS45ODA1MSAtNC40OTA1NTcsLTEuMjE2MDUgLTQuODAxOTUsMS4xODM5OCAtMC42OTA1NDUsNS4zMjc5IC0wLjUwMTkyNSwxMC40MTY2MiAwLjU4MTM2NiwxNS42Nzg2OCAwLjI2Mjk2MywxLjI3NzY2IDAuODExMTkzLDIuMTg5MzIgMS44MTY5NTQsMy4wMjAwNiA4LjAzNzU5LDYuNjQyNTEgMTkuMTg0MjI0LDYuMTk2MDIgMzMuNDQwMzI1LC0xLjMzOTI1IDAuOTMwMzU2LDAuOTMwMzYgMS45MzczOTEsMS43MTY3IDMuMDY1OTI1LDIuMzkzODcgLTkuODI1NDQ0LDguODE0ODMgLTE4Ljc4MTkyLDEyLjUxNTQ0NSAtMjYuODY4Nzg5LDExLjEwMjUgLTIuMzg0MzAxLC0wLjQxNjU0IC00LjAzNTM2MywyLjMxNTQ4NSAtMi41NTgwNTIsNC4yMzI0OTUgMy4yNzg5NzIsNC4yNTU2NSA3LjAxMDgwMSw3LjcyMDQ4OSAxMS40OTczMjIsMTAuNjc1NTU5IDEuMDg5NjYzLDAuNzE3NTIgMi4xMjE3NjMsMC45NzQxMSAzLjQyMDQzNywwLjg1MDcgMTAuMzgwMjU4LC0wLjk4NjY1IDE3Ljk0NjUxMSwtOS4xODQyMTkgMjIuNjk4NzU3LC0yNC41OTI5MjQgMS4zMTU4OCwwIDIuNTgzOTY2LC0wLjE1NTkxIDMuODYwNTUsLTAuNDc1MzcgLTAuNzE0NzU5LDEzLjE4MDUwNSAtNC40MzA4NywyMi4xMzA0NDQgLTExLjE0ODU0NiwyNi44NDk3ODQgLTEuOTgwNTA5LDEuMzkxMjkgLTEuMjE2MDQ2LDQuNDkwNTggMS4xODM5NzQsNC44MDE5NyA1LjMyNzg3NiwwLjY5MDU1IDEwLjQxNjU4LDAuNTAxOTMgMTUuNjc4NjEsLTAuNTgxMzcgMS4yNzc2NDYsLTAuMjYyOTYgMi4xODkzMDksLTAuODExMTkgMy4wMjAwNDQsLTEuODE2OTYgNi42NDI0ODIsLTguMDM3NjMgNi4xOTU5OTcsLTE5LjE4NDMwOSAtMS4zMzkyNDQsLTMzLjQ0MDQ2NCAwLjkzMDM1NSwtMC45MzAzNiAxLjcxNjY5NywtMS45Mzc0IDIuMzkzODU5LC0zLjA2NTk1IDguODE0Nzk4LDkuODI1NSAxMi41MTU0MDgsMTguNzgyMDA1IDExLjEwMjQ1MiwyNi44Njg5MTQgLTAuNDE2NTM1LDIuMzg0MzIgMi4zMTU0NzYsNC4wMzUzOSA0LjIzMjQ3NiwyLjU1ODA3IDQuMjU1NjQsLTMuMjc4OTg5IDcuNzIwNDcsLTcuMDEwODI5IDEwLjY3NTUxLC0xMS40OTczODkgMC43MTc1MiwtMS4wODk2NSAwLjk3NDExLC0yLjEyMTc2NSAwLjg1MDcxLC0zLjQyMDQzNSAtMC45ODY2NSwtMTAuMzgwMzEgLTkuMTg0MTksLTE3Ljk0NjYgLTI0LjU5MjgyMiwtMjIuNjk4ODYgMCwtMS4zMTU4OSAtMC4xNTU5MSwtMi41ODM5OSAtMC40NzUxNjEsLTMuODYwNTcgMTMuMTgwNDUzLDAuNzE0NzYgMjIuMTMwMzUzLDQuNDMwODkgMjYuODQ5NjczLDExLjE0ODU5IDEuMzkxMjgsMS45ODA1MiA0LjQ5MDU2LDEuMjE2MDYgNC44MDE5NSwtMS4xODM5OCAwLjY5MDU0LC01LjMyNzY4IDAuNTAxOTIsLTEwLjQxNTk4IC0wLjU4MTM3LC0xNS42NzgyNSB6IG0gLTQ2LjUxMjY2NSwyMi44Mzk0NyBjIC03LjMyNTgwNCwwIC0xMy4yNjQ3ODQsLTUuOTM5MDEgLTEzLjI2NDc4NCwtMTMuMjY0ODQgMCwtNy4zMjU4NCA1LjkzODk4LC0xMy4yNjQ4NSAxMy4yNjQ3ODQsLTEzLjI2NDg1IDcuMzI1ODA1LDAgMTMuMjY0Nzg1LDUuOTM5MDEgMTMuMjY0Nzg1LDEzLjI2NDg1IDAsNy4zMjU4MyAtNS45Mzg5OCwxMy4yNjQ4NCAtMTMuMjY0Nzg1LDEzLjI2NDg0IHoiCiAgICAgICBzdHlsZT0ic3Ryb2tlLXdpZHRoOjAuMjEyNDEiIC8+CiAgICA8Y2lyY2xlCiAgICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZS13aWR0aDowLjI3MzIwMiIKICAgICAgIGlkPSJwYXRoOCIKICAgICAgIGN4PSI2NSIKICAgICAgIGN5PSI2NSIKICAgICAgIHI9IjE2IiAvPgogICAgPGNpcmNsZQogICAgICAgc3R5bGU9Im9wYWNpdHk6MC45OTg7ZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDo5LjQ4MjU1O3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICBpZD0icGF0aDEwIgogICAgICAgY3g9IjY1IgogICAgICAgY3k9IjY1IgogICAgICAgcj0iNDIuNzU4NzI0IiAvPgogIDwvZz4KPC9zdmc+Cg=="
	}

	function getPipeSvg(){
		return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgd2lkdGg9IjEzMG1tIgogICBoZWlnaHQ9IjEzMG1tIgogICB2aWV3Qm94PSIwIDAgMTMwIDEzMCIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnNjAiCiAgIGlua3NjYXBlOnZlcnNpb249IjEuMC4yLTIgKGU4NmM4NzA4NzksIDIwMjEtMDEtMTUpIgogICBzb2RpcG9kaTpkb2NuYW1lPSJwaXBlLnN2ZyI+CiAgPGRlZnMKICAgICBpZD0iZGVmczU0Ij4KICAgIDxmaWx0ZXIKICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgIHN0eWxlPSJjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM6c1JHQiIKICAgICAgIGlkPSJmaWx0ZXI5MTMiCiAgICAgICB4PSItMC4wMDAzMDY5Mzc5OSIKICAgICAgIHdpZHRoPSIxLjAwMDYxMzkiCiAgICAgICB5PSItMC4wMDAzOTg1NjEyNyIKICAgICAgIGhlaWdodD0iMS4wMDA3OTcyIj4KICAgICAgPGZlR2F1c3NpYW5CbHVyCiAgICAgICAgIGlua3NjYXBlOmNvbGxlY3Q9ImFsd2F5cyIKICAgICAgICAgc3RkRGV2aWF0aW9uPSIwLjAwMjUwNTYxMzIiCiAgICAgICAgIGlkPSJmZUdhdXNzaWFuQmx1cjkxNSIgLz4KICAgIDwvZmlsdGVyPgogICAgPGZpbHRlcgogICAgICAgaW5rc2NhcGU6Y29sbGVjdD0iYWx3YXlzIgogICAgICAgc3R5bGU9ImNvbG9yLWludGVycG9sYXRpb24tZmlsdGVyczpzUkdCIgogICAgICAgaWQ9ImZpbHRlcjkxMy0wIgogICAgICAgeD0iLTAuMDAwMzA2OTM3OTkiCiAgICAgICB3aWR0aD0iMS4wMDA2MTM5IgogICAgICAgeT0iLTAuMDAwMzk4NTYxMjciCiAgICAgICBoZWlnaHQ9IjEuMDAwNzk3MiI+CiAgICAgIDxmZUdhdXNzaWFuQmx1cgogICAgICAgICBpbmtzY2FwZTpjb2xsZWN0PSJhbHdheXMiCiAgICAgICAgIHN0ZERldmlhdGlvbj0iMC4wMDI1MDU2MTMyIgogICAgICAgICBpZD0iZmVHYXVzc2lhbkJsdXI5MTUtMiIgLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMS4wNjcxNTI4IgogICAgIGlua3NjYXBlOmN4PSIyMzUuNjczODUiCiAgICAgaW5rc2NhcGU6Y3k9IjI4My40NjQ1NyIKICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ibGF5ZXIxIgogICAgIGlua3NjYXBlOmRvY3VtZW50LXJvdGF0aW9uPSIwIgogICAgIHNob3dncmlkPSJmYWxzZSIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjE0NDAiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iODM3IgogICAgIGlua3NjYXBlOndpbmRvdy14PSItOCIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iLTgiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE1NyI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGUgLz4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iTGF5ZXIgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiPgogICAgPHBhdGgKICAgICAgIGlkPSJyZWN0ODM1IgogICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6NDguNTAyMztzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxO2ZpbHRlcjp1cmwoI2ZpbHRlcjkxMykiCiAgICAgICBkPSJNIDI0NS43NDYwOSA2Ni4xODc1IEwgMjQ1Ljc0NjA5IDY5LjkyMTg3NSBBIDE3NS43NDgwMyAxNzUuNzQ4MDMgMCAwIDEgNDA4LjQ3ODUyIDE3OS40ODI0MiBMIDQ5MS4yNjE3MiAxNzkuNDgyNDIgTCA0OTEuMjYxNzIgNjYuMTg3NSBMIDI0NS43NDYwOSA2Ni4xODc1IHogIgogICAgICAgdHJhbnNmb3JtPSJzY2FsZSgwLjI2NDU4MzMzKSIgLz4KICAgIDxwYXRoCiAgICAgICBpZD0icmVjdDgzNS02IgogICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6NDguNTAyNTtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxO2ZpbHRlcjp1cmwoI2ZpbHRlcjkxMy0wKSIKICAgICAgIGQ9Ik0gMC4wNzYxNzE4NzUgMzExLjg1NTQ3IEwgMC4wNzYxNzE4NzUgNDI1LjE1MDM5IEwgMjQ1LjU5NTcgNDI1LjE1MDM5IEwgMjQ1LjU5NTcgNDIxLjQxNzk3IEEgMTc1Ljc0ODAzIDE3NS43NDgwMyAwIDAgMSA4Mi44NjEzMjggMzExLjg1NTQ3IEwgMC4wNzYxNzE4NzUgMzExLjg1NTQ3IHogIgogICAgICAgdHJhbnNmb3JtPSJzY2FsZSgwLjI2NDU4MzMzKSIgLz4KICA8L2c+Cjwvc3ZnPgo="
	}

	'use strict';

	window.chartColors = {
		red: 'rgb(255, 99, 132)',
		orange: 'rgb(255, 159, 64)',
		yellow: 'rgb(255, 205, 86)',
		green: 'rgb(75, 192, 192)',
		blue: 'rgb(54, 162, 235)',
		purple: 'rgb(153, 102, 255)',
		grey: 'rgb(201, 203, 207)'
	};

	(function(global) {
		var MONTHS = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];

		var COLORS = [
			'#4dc9f6',
			'#f67019',
			'#f53794',
			'#537bc4',
			'#acc236',
			'#166a8f',
			'#00a950',
			'#58595b',
			'#8549ba'
		];

		var Samples = global.Samples || (global.Samples = {});
		var Color = global.Color;

		Samples.utils = {
			// Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
			srand: function(seed) {
				this._seed = seed;
			},

			rand: function(min, max) {
				var seed = this._seed;
				min = min === undefined ? 0 : min;
				max = max === undefined ? 1 : max;
				this._seed = (seed * 9301 + 49297) % 233280;
				return min + (this._seed / 233280) * (max - min);
			},

			numbers: function(config) {
				var cfg = config || {};
				var min = cfg.min || 0;
				var max = cfg.max || 1;
				var from = cfg.from || [];
				var count = cfg.count || 8;
				var decimals = cfg.decimals || 8;
				var continuity = cfg.continuity || 1;
				var dfactor = Math.pow(10, decimals) || 0;
				var data = [];
				var i, value;

				for (i = 0; i < count; ++i) {
					value = (from[i] || 0) + this.rand(min, max);
					if (this.rand() <= continuity) {
						data.push(Math.round(dfactor * value) / dfactor);
					} else {
						data.push(null);
					}
				}

				return data;
			},

			labels: function(config) {
				var cfg = config || {};
				var min = cfg.min || 0;
				var max = cfg.max || 100;
				var count = cfg.count || 8;
				var step = (max - min) / count;
				var decimals = cfg.decimals || 8;
				var dfactor = Math.pow(10, decimals) || 0;
				var prefix = cfg.prefix || '';
				var values = [];
				var i;

				for (i = min; i < max; i += step) {
					values.push(prefix + Math.round(dfactor * i) / dfactor);
				}

				return values;
			},

			months: function(config) {
				var cfg = config || {};
				var count = cfg.count || 12;
				var section = cfg.section;
				var values = [];
				var i, value;

				for (i = 0; i < count; ++i) {
					value = MONTHS[Math.ceil(i) % 12];
					values.push(value.substring(0, section));
				}

				return values;
			},

			color: function(index) {
				return COLORS[index % COLORS.length];
			},

			transparentize: function(color, opacity) {
				var alpha = opacity === undefined ? 0.5 : 1 - opacity;
				return Color(color).alpha(alpha).rgbString();
			}
		};

		// DEPRECATED
		window.randomScalingFactor = function() {
			return Math.round(Samples.utils.rand(-100, 100));
		};

		// INITIALIZATION

		Samples.utils.srand(Date.now());

		// Google Analytics
		/* eslint-disable */
		if (document.location.hostname.match(/^(www\.)?chartjs\.org$/)) {
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
			ga('create', 'UA-28909194-3', 'auto');
			ga('send', 'pageview');
		}
		/* eslint-enable */

	}(this));

