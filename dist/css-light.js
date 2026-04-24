export function cssDataLight() {
  var css =`
    
        ha-card {
            --box-background-color: #ffffff;  	/* Couleur de fond de la box */
            --box-shadow-color: #4a8cc4;      	/* Couleur de l'ombre de la box */
            --anchor-color: #4a8cc4;            /* Couleur du point d'accroche */
	    --line-color: #4a8cc4; 				/* Couleur de la ligne */
        }
        
        .db-container {
            position: relative;
            width: 100%; /* Prend toute la largeur disponible */
            padding-bottom: 60%; /* Sets height to 60% of width */
            overflow: hidden; /* Hide any overflow */
        }
        
  
        .dashboard {
            display: flex;
            width: 100%;
            height: 100%;
            padding: 25px 20px 15px 20px;
            border-radius: 10px;
            /*border: 1px solid #ccc;*/
            position: absolute;
            box-sizing: border-box;
            background-color: #fafafa;
            gap: 8%;
        }

        .column {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 33.33%;
        }

        .column-1 {
            width: 25%;
        }

        .column-2 {
            width: 34%;
        }

        .column-3 {
            width: 25%;
        }

        .box {
            background-color: var(--box-background-color);  /* Utilisation de la variable pour la couleur de fond */
            color: #484848;
            /*font-weight: bold;*/
            border-radius: 5px;
            box-shadow: 0px 0px 1px 2px var(--box-shadow-color);  /* Utilisation de la variable pour la couleur de l'ombre */
            height: 100%;
            max-height: 37%;
            margin: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            
            padding: 3% 5%;
        }

        .box:only-child {
            max-height: 100%;
        }

        /* Point d'accroche */
        .anchor {
            position: absolute;
            background-color: var(--anchor-color); /* Utilisation de la variable pour la couleur du point d'accroche */
            border-radius: 50%; /* Rond */
			box-shadow: 0px 0px 1px 1px var(--anchor-color);
        }

        /* Position des points pour la colonne 2 */
        .box .anchor-L {
			width: 5px;
            height: 10px;
            left: -6px;
            top: 50%;
            transform: translateY(-50%);
			border-radius: 5px 0 0 5px;
        }

        .box .anchor-R {
			width: 5px;
            height: 10px;
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
			border-radius: 0 5px 5px 0;
        }
		
		.box .anchor-T {
			width: 10px;
            height: 5px;
            top: -6px;
            left: 50%;
            transform: translateX(-50%);
			border-radius: 5px 5px 0 0;
        }
		
		.box .anchor-B {
			width: 10px;
            height: 5px;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
			border-radius: 0 0 5px 5px;
        }

        .line {
            position: absolute;
			left: 0px;
			top: 0px;
        }
		
		.line g path{
			stroke: var(--line-color);
			box-shadow: 0px 0px 1px 1px var(--line-color);
        }
		
		.ball {
			z-index: 1000;
		}
		

        .content {
            position: relative;
			display: flex;
			flex-direction: column;
			width: 100%;
			height: 100%;
			/*gap: calc(2.1vw - 15px);*/
			gap: 2%;
		}
		
		.boxHeader {
			display: flex;
			align-items: center;
			width: 100%;
			height: 15%;
			gap: 3%;
			z-index: 2;
		}
		
		.boxIcon {
			--mdc-icon-size: 1.2em;
			line-height: 1.2em;
			z-index: 2;
		}
		
		.boxTitle {
		    display: flex;
			align-items: center;
			width: 100%;
			font-size: calc(var(--card-width) * 0.1);;
			/*line-height: 1.8em;*/
			z-index: 2;
		}
		
		.headerEntity {
			/*position: absolute;*/
			display: flex;
			align-items: center;
			font-size: 1.1em;
			line-height: 1.1em;
			gap: 3%;
			z-index: 2;
		}
		
		.boxSensor1 {
			display: flex;
			align-items: center;
			width: 100%;
			font-size: 1em;
			line-height: 1em;
			z-index: 2;
			gap: 3%
		}
		
		.boxSensor2 {
			display: flex;
			align-items: center;
			width: 100%;
			font-size: 0.8em;
			line-height: 0.8em;
			z-index: 2;
			gap: 3%
		}
		
		.boxUnit {
			/*width: 100%;*/
			color: #aaaaaa;
			z-index: 2;
		}
		
		.graph {
			position: absolute;
			bottom: 15%;
			width: 100%;
			height: 30%;
			opacity: 1;
			z-index: 2;
			/*border-radius: 0 0 5px 5px;*/
		}
		
		.gauge {
			position: absolute;
			left: 0px;
			bottom: 0px;
			width: 100%;
			background: linear-gradient(to bottom, #5a9fd4, #4a8cc4);
			opacity: 0.8;
			z-index: 1;
			border-radius: 0 0 5px 5px;
		}

		/* gauge texture overlay removed — clean fill matches Victron GX gui-v2 */
		
		.sideGauge {
			position: absolute;
			right: 5px;
			top: 5px;
			bottom: 5px;
			width: 6px;
			z-index: 3;
			border-radius: 3px;
			overflow: visible;
			pointer-events: none;
		}

		@keyframes boxExceededFlash {
			0%, 100% {
				box-shadow:
					0px 0px 1px 2px var(--box-shadow-color),
					0 0 2px 1px rgba(217, 74, 74, 0.3);
			}
			50% {
				box-shadow:
					0px 0px 1px 2px var(--box-shadow-color),
					0 0 14px 5px rgba(217, 74, 74, 0.9);
			}
		}

		.box.box-exceeded {
			animation: boxExceededFlash 0.6s ease-in-out infinite;
		}

		.gauge.exceeded {
			box-shadow: inset 0 0 0 2px #d94a4a, 0 0 10px 3px rgba(217, 74, 74, 0.9) !important;
		}

		.gauge.warned {
			box-shadow: inset 0 0 0 2px #d94a4a, 0 0 6px 2px rgba(217, 74, 74, 0.6) !important;
		}

		.sideGaugeTrack {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0,0,0,0.15);
		}
		
		.sideGaugeFill {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 0%;
			background: linear-gradient(to top, #3a7bc8, #5a8fd0);
			transition: height 0.5s ease, background 0.3s ease;
		}

		.boxFooter {
			position: absolute;
			display: flex;
			bottom: 2px;
			width: 100%;
			font-size: 1em;
			align-items: center;
			gap: 3%;
			z-index: 1;
		}
		
		.footerCell {
			display: flex;
			line-height: 1em;
			align-items: center;
			justify-content: center;
			width: 30%;
			gap: 5%;
		}

		.capitalize-values .boxSensor1,
		.capitalize-values .boxSensor2,
		.capitalize-values .headerEntity,
		.capitalize-values .footerCell {
			text-transform: capitalize;
		}

		/* Battery charging animation - exact replica of gui-v2 */
		@keyframes batteryChargingWave {
			0% {
				bottom: -80px;
			}
			59%, 99.99% {
				bottom: 100%;
			}
			100% {
				bottom: -80px;
			}
		}

		.gauge {
			position: absolute;
			left: 0px;
			bottom: 0px;
			width: 100%;
			background: linear-gradient(to bottom, #5a9fd4, #4a8cc4);
			opacity: 0.8;
			z-index: 1;
			border-radius: 0 0 5px 5px;
			overflow: hidden;
		}

		.chargingAnimationClip {
			position: absolute;
			left: 0;
			bottom: 0;
			width: 100%;
			height: 100%;
			overflow: hidden;
			z-index: 2;
			pointer-events: none;
		}

		.chargingAnimationClip::before {
			content: '';
			position: absolute;
			left: 0;
			bottom: -80px;
			width: 100%;
			height: 80px;
			background: linear-gradient(
				to bottom,
				rgba(255, 255, 255, 0.3) 0%,
				rgba(255, 255, 255, 0.15) 30%,
				rgba(255, 255, 255, 0) 100%
			);
			animation: batteryChargingWave 2.2s cubic-bezier(0.25, 0.5, 0.75, 1) infinite;
		}

		.box:not(.charging) .chargingAnimationClip {
			display: none;
		}
		
  `
  return css;

}
  
