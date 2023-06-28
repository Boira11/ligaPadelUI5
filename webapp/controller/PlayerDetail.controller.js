sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    'sap/ui/core/Fragment',
    "sap/ui/core/library",
    'sap/m/MessageToast'
], function (Controller, JSONModel, MessageBox, Fragment,CoreLibrary, MessageToast) {
    "use strict";


    return Controller.extend("padelmasterdetail.controller.PlayerDetail", {

        onInit: function () {

            this.getOwnerComponent().getRouter().getRoute("playerDetail").attachPatternMatched(this._onObjectMatched, this);

            var oViewModel = new JSONModel({
                busy: false,
                delay: 0
            });

            this.getView().setModel(oViewModel, "detailView");

            this.oModelWizard = new sap.ui.model.json.JSONModel();
            this.oModelWizard.setData({
                backButtonVisible: false,
                nextButtonVisible: true,
                nextButtonEnabled: true,
                reviewButtonVisible: false,
                finishButtonVisible: false
            });
            this.getView().setModel(this.oModelWizard);
            this.getIdLesiones();
    
        },

        

        _onObjectMatched: function (oEvent) {

            var oHistorialJugadores = this.getOwnerComponent().getModel("jugadoresPadel");
		    this.getView().setModel(oHistorialJugadores, "model");

            var oArgs = oEvent.getParameter("arguments");
            this.sPlayerId = Number(oArgs.playerId);

            this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            //1. oModelPartidos recoge todos los partidos 
            var aHistorialPartidos = this.getView().getModel("jugadoresPadel").getContext("/Partidos").getObject()

            //2. aHistorialJugadores recoge todos los Jugadores 
            var aHistorialJugadores = this.getView().getModel("jugadoresPadel").getContext("/jugadores").getObject()

            //3. aHistorialLesiones recoge todas las lesiones
            var aHistorialLesiones = this.getView().getModel("jugadoresPadel").getContext("/historialLesiones").getObject()
            console.log("Todas las lesiones: ", aHistorialLesiones)
            //Nos devuuelve el modelo del jugador seleccionado
            var oJugadorSeleccionado = aHistorialJugadores.filter(jugadores => jugadores.id === this.sPlayerId).pop();
            //Creamos un nuevo modelo JSON y se lo asignamos a la vista
            var jsmJugadorSeleccionado = new JSONModel(oJugadorSeleccionado);
            this.getView().setModel(jsmJugadorSeleccionado, "jugadoresPadelModel");
            

            //Nos devuelve la lesion del jugador seleccionado
            var aLesionesJugadorSeleccionado = aHistorialLesiones.filter(lesion => lesion.idJugador === this.sPlayerId);
            // Creamos un nuevo modelo JSON y se lo asignamos a la vista
            var jsmLesionesJugadorSeleccionado = new JSONModel({"lesiones": aLesionesJugadorSeleccionado})
            this.getView().setModel(jsmLesionesJugadorSeleccionado, "lesiones");

            //Nos devuelve los partidos del jugador seleccionado
             var partidosDelJugador = aHistorialPartidos.filter(partido => {
                return partido.idJugador1 === this.sPlayerId || partido.idJugador2 === this.sPlayerId;
              });
              console.log(partidosDelJugador);
            
            for (var i =0; i<partidosDelJugador.length;i++){

                for(var j =0 ;j<aHistorialJugadores.length ;j++){

                    if(partidosDelJugador[i].idJugador1 == aHistorialJugadores[j].id){
    
                        partidosDelJugador[i].jugadorLocal = aHistorialJugadores[j].nombre
                    }
    
                    else if(partidosDelJugador[i].idJugador2 == aHistorialJugadores[j].id){
    
                        partidosDelJugador[i].jugadorVisitante = aHistorialJugadores[j].nombre
                    }
                    
                }
            }

            console.log(partidosDelJugador);

            var jsmPartidosJugadorSeleccionado = new JSONModel({"partidos": partidosDelJugador})
            this.getView().setModel(jsmPartidosJugadorSeleccionado, "partidos");

               
        },

        getIdLesiones: function (){

            var aHistorialJugadores = this.getView().getModel("jugadoresPadel").getContext("/jugadores").getObject()

            console.log("ENTRA AL getIdLesiones")
            console.log("Jugadores ",aHistorialJugadores);


        },

       

            onAddMatch: function (){

                var oModelPartidosJugador = this.getView().getModel("jugadoresPadel").getContext("/Partidos").getObject().filter(lesion => lesion.idJugador === this.sPlayerId);

                var oModelHistorialPartidos = this.getView().getModel("jugadoresPadel").getContext("/Partidos").getObject()

                var oModelP = this.getView().getModel("partidos").getContext("/partidos").getObject()


                //Obtenemos el id del jugador
                var jugadorId = this.sPlayerId
                console.log("ID del jugador en otra función: ", jugadorId);

                // Obtén las referencias a los campos de entrada (Modifica los id de los campos de acuerdo a tu vista)
                var oIdJugador1Field = this.byId("idJugador1");
                var oIdJugador2Field = this.byId("idJugador2");        
                var oResultadoJLSet1Field = this.byId("idResultadoJLSet1");
                var oResultadoJVSet1Field = this.byId("idResultadoJVSet1");
                var oResultadoJLSet2Field = this.byId("idResultadoJLSet2");
                var oResultadoJVSet2Field = this.byId("idResultadoJVSet2");
                var oResultadoJLTBField = this.byId("idResultadoJLTB");
                var oResultadoJVTBField = this.byId("idResultadoJVTB");

                // Obtén los valores de los campos de entrada
            
                var sIdJugador1 = oIdJugador1Field.getValue();
                var sIdJugador2 = oIdJugador2Field.getValue();
                var sResultadoJLSet1 = oResultadoJLSet1Field.getValue();
                var sResultadoJVSet1 = oResultadoJVSet1Field.getValue();
                var sResultadoJLSet2 = oResultadoJLSet2Field.getValue();
                var sResultadoJVSet2 = oResultadoJVSet2Field.getValue();
                var sResultadoJLTB = oResultadoJLTBField.getValue();
                var sResultadoJVTB = oResultadoJVTBField.getValue();
        

                // Encuentra el idPartido más grande existente y añade 1 para obtener el nuevo id
                var sIdPartido = oModelP.length > 0 ? Math.max.apply(Math, oModelP.map(function(o) { return o.idPartido; })) + 1 : 1;

                // Crea un nuevo objeto partido con los valores recogidos
                var oNewMatch = {
                // Crea tu objeto de partido aquí con los datos recogidos
                };

                oNewMatch.idPartido = sIdPartido;
                oNewMatch.idJugador1 = sIdJugador1;
                oNewMatch.idJugador2 = sIdJugador2
                oNewMatch.Set1Local = sResultadoJLSet1;
                oNewMatch.Set1Visitante = sResultadoJVSet1;
                oNewMatch.Set2Local = sResultadoJLSet2;
                oNewMatch.Set2Visitante = sResultadoJVSet2;
                oNewMatch.TieBreakLocal = sResultadoJLTB;
                oNewMatch.TieBreakVisitante = sResultadoJVTB;

                oModelHistorialPartidos.push(oNewMatch)
                oModelP.push(oNewMatch)

            this.getView().getModel("jugadoresPadel").setProperty("/Partidos", oModelHistorialPartidos);
            
            this.getView().getModel("jugadoresPadel").refresh(true);   
            this.getView().getModel("partidos").setProperty("/partidos", oModelP);
            this.getView().getModel("partidos").refresh(true);  

            this.onCloseDialogCreateMatch();
            

            },

        // ************************************************************************************************
        // ************************************************************************************************
        
        // *************************  FUNCIONES PARA EL USO DEL WIZARD   **********************************

        // ************************************************************************************************
        // ************************************************************************************************

        MatchTypeActivate: function() {
            // Este es un controlador de eventos para cuando se active el primer paso del asistente.
            // Aquí puedes verificar o manipular los datos antes de que el usuario llegue a este paso.
            console.log("El primer paso del asistente ha sido activado.");
        },
        matchTypeActivate2: function() {
            // Este es un controlador de eventos para cuando se active el segundo y tercer paso del asistente.
            // Aquí puedes verificar o manipular los datos antes de que el usuario llegue a este paso.
            console.log("El segundo y tercer paso del asistente han sido activados.");
        },

        handleWizardSubmit: function() {
            // Este es un controlador de eventos para cuando el usuario haga clic en el botón de envío.
            // Aquí puedes manejar la recopilación y envío de los datos ingresados.
            console.log("El botón de envío ha sido presionado. Recopilando y enviando los datos ingresados...");
        
            // Para demostrar, aquí es donde recogerías los datos ingresados en el formulario.
            var oData = this.getView().getModel().getData();
        
            // Luego puedes enviar estos datos a donde sea necesario.
            console.log("oDATA", oData);
        },
        
        handleWizardCancel: function() {
            // Este es un controlador de eventos para cuando el usuario haga clic en el botón de cancelar.
            // Aquí puedes manejar cualquier limpieza o revertir cambios que se necesiten cuando se cancele el asistente.
            console.log("El asistente ha sido cancelado. Limpiando cualquier cambio hecho durante el asistente...");
        
            // Por ejemplo, puedes restablecer los datos del modelo a su estado inicial.
            this.getView().getModel().setData({});  
        },

        handleNavigationChange: function (oEvent) {
            // En este método puedes manejar la lógica para cuando el usuario cambia de paso en el Wizard.
            // Por ejemplo, puedes manejar la visibilidad de los botones y validar los datos introducidos.
            var oWizard = this.byId("CreatematchWizard");
            var oStep = oEvent.getParameter("target");
            
            if (oWizard.getProgressStep() === oStep) {
                // Permitir la navegación solo si el paso es válido.
                this.oModelWizard.setProperty("/nextButtonEnabled", true);
                this.oModelWizard.setProperty("/backButtonVisible", oWizard.getProgress() > 1);
                this.oModelWizard.setProperty("/reviewButtonVisible", oWizard.getProgress() === oWizard.getSteps().length);
            } else {
                // Impedir la navegación si el paso no es válido.
                this.oModelWizard.setProperty("/nextButtonEnabled", false);
            }
        },

        onDialogBackButton: function () {
            // Al pulsar el botón atrás, simplemente volvemos al paso anterior del Wizard.
            var oWizard = this.byId("CreatematchWizard");
            oWizard.previousStep();
        },

        onDialogNextButton: function () {
           
            // Al pulsar el botón siguiente, avanzamos al siguiente paso del Wizard si es posible.
            var oWizard = this.byId("CreatematchWizard");
            if (this.oModelWizard.getProperty("/nextButtonEnabled")) {
                oWizard.nextStep();
            }
        },
        
        //     ************************************************************************************************
        //     ************************************************************************************************
        
        //    *************************  FINALIZAMOS FUNCIONES WIZARD   **********************************

        //     ************************************************************************************************
        //     ************************************************************************************************

        onCloseDetailPress: function () {
            this.getView().getModel("appView").setProperty("/layout", "OneColumn");
            this.getOwnerComponent().getRouter().navTo("RouteMain");
        },

        openDialogEditPlayer : function(){

            var oView = this.getView();

            // create value help dialog

            if (!this._editPlayer) {
                this._editPlayer = Fragment.load({
                    id: oView.getId(),
                    name: "padelmasterdetail.view.fragments.editPlayer",
                    controller: this
                },

                ).then(function (oCreateDialog) {
                    oView.addDependent(oCreateDialog); // El addDependent es como unir el dialogo a su Vista ( siempre hay que hacerlo) al crear el fragmento
                    return oCreateDialog;

                });
            }
            //open value help dialog
            this._editPlayer.then(function (oCreateDialog) {
                oCreateDialog.open();
            })


        },

        onEditPlayer: function(){

            
            var oModelEditPlayer = this.getView().getModel("jugadoresPadel").getContext("/jugadores").getObject().filter(jugadores => jugadores.id === this.sPlayerId).pop();
            console.log("oModelEditPlayer", oModelEditPlayer)

            var cityPlayerAnterior = oModelEditPlayer.poblacion;
            console.log(cityPlayerAnterior);

            var modelEditPlayer = new JSONModel(oModelEditPlayer);
            this.getView().setModel(modelEditPlayer, "modelEditPlayer");

            var oCityField = this.byId("idEditCity").getValue();
            console.log("oCityField", oCityField);

            oModelEditPlayer.poblacion = oCityField;

            console.log("oModelEditPlayer despues de agregar ciudad", oModelEditPlayer)

            this.getView().getModel("jugadoresPadel").refresh(true);   
            this.getView().getModel("modelEditPlayer").refresh(true);  

            this.onCloseEditPlayerDialog();   

        },

        onCloseEditPlayerDialog : function(){

            this.resetEditPlayerDialog();
            if(this._editPlayer){
            this._editPlayer.then(function (oCreateDialog) {
                oCreateDialog.close();
            })
        }
        },

        resetEditPlayerDialog: function(){
            // Obtén las referencias a los campos de entrada
            var oCityField = this.byId("idEditCity");
    

            // Establece el valor de los campos de entrada en blanco para limpiarlos
            oCityField.setValue("");

        },

        onDeletePlayerButtonPress: function () {

            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var oModel = this.getView().getModel("jugadoresPadel");
            var that = this;
            this.getView().setModel(oModel, "jugadoresPadel");

            sap.m.MessageBox.warning(oResourceBundle.getText("btn.delete.message"), {
                actions: [oResourceBundle.getText("messageBox.action.OK"), sap.m.MessageBox.Action.CANCEL],
                onClose: function (sAction) {
                    if (sAction === oResourceBundle.getText("messageBox.action.OK")) {
                        var data = oModel.getData();
                        if (data.jugadores && data.jugadores.length > this.sObjectId) {
                            var playerIndex = data.jugadores.findIndex(function (player) {
                                return player.id === this.sObjectId;
                            }.bind(this));
                            if (playerIndex !== -1) {
                                data.jugadores.splice(playerIndex + 1, 1);
                                oModel.setData(data);
                                sap.m.MessageBox.success(oResourceBundle.getText("message.sucessDelete"), {
                                    onClose: function () {
                                        that.onCloseDetailPress();
                                        oModel.refresh(true);
                                    }
                                });
                            } else {
                                sap.m.MessageBox.error(oResourceBundle.getText("message.errorDelete"), {
                                    onClose: function () {
                                    }
                                });
                            }
                        } else {
                            sap.m.MessageBox.error(oResourceBundle.getText("message.errorDelete"), {
                                onClose: function () {
                                }
                            });
                        }
                    }
                }.bind(this)
            });
        },

        //Funcion para abrir el dialogo para crear la lesion
        onOpenFragmentInjury: function () {

            var oView = this.getView();

            // create value help dialog

            if (!this._createInjury) {
                this._createInjury = Fragment.load({
                    id: oView.getId(),
                    name: "padelmasterdetail.view.fragments.AddInjury",
                    controller: this
                },

                ).then(function (oCreateDialog) {
                    oView.addDependent(oCreateDialog); // El addDependent es como unir el dialogo a su Vista ( siempre hay que hacerlo) al crear el fragmento
                    return oCreateDialog;

                });
            }
            //open value help dialog
            this._createInjury.then(function (oCreateDialog) {
                oCreateDialog.open();
            })

        },

        onOpenFragmentCreateMatch: function () {

            var oView = this.getView();

            // create value help dialog

            if (!this._createMatch) {
                this._createMatch = Fragment.load({
                    id: oView.getId(),
                    name: "padelmasterdetail.view.fragments.CreateMatch",
                    controller: this
                },

                ).then(function (oCreateDialog) {
                    oView.addDependent(oCreateDialog); // El addDependent es como unir el dialogo a su Vista ( siempre hay que hacerlo) al crear el fragmento
                    return oCreateDialog;

                });
            }
            //open value help dialog
            this._createMatch.then(function (oCreateDialog) {
                oCreateDialog.open();
            })

        },


        onCloseDialogCreateMatch: function () {

           //this.resetDialogInjury();
            if(this._createMatch){
            this._createMatch.then(function (oCreateDialog) {
                oCreateDialog.close();
            })
        }
        },

        //Abrimos Wizard para creacion de partido ( vamos a implementarlo con un dialogo normal)
        onOpenFragmentCreateMatchWizard: function () {

            var oView = this.getView();

            // create value help dialog

            if (!this._createMatchWizard) {
                this._createMatchWizard = Fragment.load({
                    id: oView.getId(),
                    name: "padelmasterdetail.view.fragments.wizardCreateMatch",
                    controller: this
                },

                ).then(function (oCreateDialog) {
                    oView.addDependent(oCreateDialog); // El addDependent es como unir el dialogo a su Vista ( siempre hay que hacerlo) al crear el fragmento
                    return oCreateDialog;

                });
            }
            //open value help dialog
            this._createMatchWizard.then(function (oCreateDialog) {
                oCreateDialog.open();
            })

        },

        onCloseWizardCreateMatch: function () {

            // this.resetDialog();
            if(this._createMatchWizard){
            this._createMatchWizard.then(function (oCreateDialog) {
                oCreateDialog.close();
            })
        }
        },

        onAddInjury: function () {

            // Obtén el modelo y la ruta al jugador seleccionado
            var oModelLesionesJugador = this.getView().getModel("jugadoresPadel").getContext("/historialLesiones").getObject().filter(lesion => lesion.idJugador === this.sPlayerId)
            console.log("Lesiones Jugador ", oModelLesionesJugador);

            var oModelHistorialLesiones = this.getView().getModel("jugadoresPadel").getContext("/historialLesiones").getObject()

            var oModelL = this.getView().getModel("lesiones").getContext("/lesiones").getObject()

            //Obtenemos el id del jugador
            var jugadorId = this.sPlayerId
            console.log("ID del jugador en otra función: ", jugadorId);

            // Obtén las referencias a los campos de entrada
           
            var oFechaField = this.byId("idFechaLesion");
            var oTipoField = this.byId("idTipoLesion1");
            var oRecuperacionField = this.byId("idRecuperacion1");

            // Obtén los valores de los campos de entrada
            
            var sFecha = oFechaField.getValue();
            var sTipo = oTipoField.getValue();
            var sRecuperacion = oRecuperacionField.getValue();

             // Convierte sFecha a un objeto Date de JavaScript
             var oFecha = new Date(sFecha);

             // Obtén la fecha actual
            var oToday = new Date();
        
            // Comprueba si la fecha ingresada es en el futuro
            if (oFecha > oToday) {
                // Si la fecha ingresada es en el futuro, muestra un mensaje de error y no procedas
                MessageBox.warning("La fecha de la lesión no puede ser futura.");
                oFechaField.setValue("");
                return;
            }

            else if(!sFecha){
                MessageBox.warning("Indica la fecha de lesion");
                return

            }

            else if (!sTipo){
                MessageBox.warning("Indica el tipo de lesion");
                return
            }

            else if (!sRecuperacion){
                MessageBox.warning("Indica el tiempo de recuperacion");
                return
            }

             // Encuentra el idLesion más grande existente y añade 1 para obtener el nuevo id
             var sId = oModelL.length > 0 ? Math.max.apply(Math, oModelL.map(function(o) { return o.idLesion; })) + 1 : 1;

            // Crea un nuevo objeto lesion con los valores recogidos
            var oNewInjury = {
               
            };

            oNewInjury.idJugador= jugadorId;
            oNewInjury.idLesion= sId;
            oNewInjury.Fecha= sFecha;
            oNewInjury.Tipo= sTipo;
            oNewInjury.RecuperacionDias= sRecuperacion;


           console.log(oNewInjury)    

           oModelHistorialLesiones.push(oNewInjury)
           console.log("Lesiones generales (Historial de lesiones) :", oModelHistorialLesiones)
           console.log("Lesiones del jugador:", oModelL);
           oModelL.push(oNewInjury)
           this.getView().getModel("jugadoresPadel").setProperty("/historialLesiones", oModelHistorialLesiones);
          
           this.getView().getModel("jugadoresPadel").refresh(true);   
           this.getView().getModel("lesiones").setProperty("/lesiones", oModelL);
           this.getView().getModel("lesiones").refresh(true);  

           this.onCloseDialogInjury();
           
        },
        
        resetDialogInjury: function(){
            // Obtén las referencias a los campos de entrada
            var oIdField = this.byId("idCreateInjury");
            var oFechaField = this.byId("idFechaLesion");
            var oTipoField = this.byId("idTipoLesion1");
            var oRecuperacionField = this.byId("idRecuperacion1");

            // Establece el valor de los campos de entrada en blanco para limpiarlos
            oIdField.setValue("");
            oFechaField.setValue("");
            oTipoField.setValue("");
            oRecuperacionField.setValue("");

        },

        onCloseDialogInjury: function () {

            this.resetDialogInjury();
            if(this._createInjury){
            this._createInjury.then(function (oCreateDialog) {
                oCreateDialog.close();
            })
        }
        },

        onCloseDialog: function () {

            // this.resetDialog();
            if(this._createPlayers){
            this._createPlayers.then(function (oCreateDialog) {
                oCreateDialog.close();
            })
        }
        },
        
    });
});
