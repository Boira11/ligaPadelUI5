sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/core/Fragment',
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/m/Label',
	'sap/ui/comp/smartvariants/PersonalizableInfo'


], function (Controller, Fragment, MessageBox, JSONModel, Sorter, Filter, FilterOperator, Label, PersonalizableInfo) {
	"use strict";

	return Controller.extend("padelmasterdetail.controller.Main", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter()

			var oModel = this.getOwnerComponent().getModel("jugadoresPadel")
			this.getView().setModel(oModel, "model");

			console.log(this.getView().getModel("model").getContext("/jugadores").getObject())
			var oCities = new sap.ui.model.json.JSONModel("model/cities.json");
			this.getView().setModel(oCities);

			this._bDescendingSort = false;
			
			//ESTO ES DE LA API PARA EL FILTRO

			this.applyData = this.applyData.bind(this);
			this.fetchData = this.fetchData.bind(this);
			this.getFiltersWithValues = this.getFiltersWithValues.bind(this);

			this.oSmartVariantManagement = this.getView().byId("svm");
			this.oExpandedLabel = this.getView().byId("expandedLabel");
			this.oSnappedLabel = this.getView().byId("snappedLabel");
			this.oFilterBar = this.getView().byId("filterbar");
			this.oTable = this.getView().byId("table");

			this.oFilterBar.registerFetchData(this.fetchData);
			this.oFilterBar.registerApplyData(this.applyData);
			this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);

			var oPersInfo = new PersonalizableInfo({
				type: "filterBar",
				keyName: "persistencyKey",
				dataSource: "",
				control: this.oFilterBar
			});
			this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
			this.oSmartVariantManagement.initialise(function () { }, this.oFilterBar);

			// HASTA AQUI                   
		},
		
		onPressOpenTeams: function () {
			console.log("Entra al onPressOpenTeams")
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("TeamsDetail", {}, true);
		},
		onCleanPress: function () {
			var oFilterBar = this.byId("filterbar");
			var oFilterItems = oFilterBar.getFilterItems();

			for (var i = 0; i < oFilterItems.length; i++) {
				var oControl = oFilterItems[i].getControl();
				if (oControl instanceof sap.m.MultiComboBox) {
					oControl.setSelectedKeys([]);
				}
			}

			this.onSearch();
		},


		// ESTO ES DE LA API PARA EL FILTRO

		fetchData: function () {
			var aData = this.oFilterBar.getAllFilterItems().reduce(function (aResult, oFilterItem) {
				aResult.push({
					groupName: oFilterItem.getGroupName(),
					fieldName: oFilterItem.getName(),
					fieldData: oFilterItem.getControl().getSelectedKeys()
				});

				return aResult;
			}, []);

			return aData;
		},

		applyData: function (aData) {
			aData.forEach(function (oDataObject) {
				var oControl = this.oFilterBar.determineControlByName(oDataObject.fieldName, oDataObject.groupName);
				oControl.setSelectedKeys(oDataObject.fieldData);
			}, this);
		},

		getFiltersWithValues: function () {
			var aFiltersWithValue = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
				var oControl = oFilterGroupItem.getControl();

				if (oControl && oControl.getSelectedKeys && oControl.getSelectedKeys().length > 0) {
					aResult.push(oFilterGroupItem);
				}

				return aResult;
			}, []);

			return aFiltersWithValue;
		},

		onSelectionChange: function (oEvent) {
			this.oSmartVariantManagement.currentVariantSetModified(true);
			this.oFilterBar.fireFilterChange(oEvent);
		},

		onSearch: function () {
			var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
				var oControl = oFilterGroupItem.getControl(),
					aSelectedKeys = oControl.getSelectedKeys(),
					aFilters = aSelectedKeys.map(function (sSelectedKey) {
						if (oFilterGroupItem.getName() === 'age') {
							var aAgeRange = sSelectedKey.split("-"),
								iMinAge = parseInt(aAgeRange[0]),
								iMaxAge = aAgeRange[1] === "+" ? Infinity : parseInt(aAgeRange[1]);
							return new Filter({
								path: "age",
								operator: FilterOperator.BT,
								value1: iMinAge,
								value2: iMaxAge
							});
						} else {
							return new Filter({
								path: oFilterGroupItem.getName(),
								operator: FilterOperator.Contains,
								value1: sSelectedKey
							});
						}
					});

				if (aSelectedKeys.length > 0) {
					aResult.push(new Filter({
						filters: aFilters,
						and: false
					}));
				}

				return aResult;
			}, []);

			this.oTable.getBinding("items").filter(aTableFilters);
			this.oTable.setShowOverlay(false);
		},


		onFilterChange: function () {
			this._updateLabelsAndTable();
		},

		onAfterVariantLoad: function () {
			this._updateLabelsAndTable();
		},

		getFormattedSummaryText: function () {
			var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

			if (aFiltersWithValues.length === 0) {
				return "No filters active";
			}

			if (aFiltersWithValues.length === 1) {
				return aFiltersWithValues.length + " filter active: " + aFiltersWithValues.join(", ");
			}

			return aFiltersWithValues.length + " filters active: " + aFiltersWithValues.join(", ");
		},

		getFormattedSummaryTextExpanded: function () {
			var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

			if (aFiltersWithValues.length === 0) {
				return "No filters active";
			}

			var sText = aFiltersWithValues.length + " filters active",
				aNonVisibleFiltersWithValues = this.oFilterBar.retrieveNonVisibleFiltersWithValues();

			if (aFiltersWithValues.length === 1) {
				sText = aFiltersWithValues.length + " filter active";
			}

			if (aNonVisibleFiltersWithValues && aNonVisibleFiltersWithValues.length > 0) {
				sText += " (" + aNonVisibleFiltersWithValues.length + " hidden)";
			}

			return sText;
		},

		_updateLabelsAndTable: function () {
			this.oExpandedLabel.setText(this.getFormattedSummaryTextExpanded());
			this.oSnappedLabel.setText(this.getFormattedSummaryText());
			this.oTable.setShowOverlay(true);
		},


		//HASTA AQUI EL FILTRO DE LA API

		//Funcion PARA ORDENAR
		onSort: function () {

			var oPlayersTable = this.getView().byId("table");
			var oBinding = oPlayersTable.getBinding("items");

			// Alternar el orden entre ascendente y descendente
			this._bDescendingSort = !this._bDescendingSort;

			var oSorter = new Sorter("nombre", !this._bDescendingSort);

			oBinding.sort(oSorter);

		},

		//DEVUELVE EL ORDEN POR ID
		onOrderId: function () {
			var oPlayersTable = this.getView().byId("table");
			var oBinding = oPlayersTable.getBinding("items");
			var oSorter = new Sorter("id", false); // Orden ascendente

			oBinding.sort(oSorter);
		},

		// FUNCION PARA ABRIR EL DIALOGO para crear un nuevo Jugador
		onPressOpenCreatePlayer: function () {
			var oView = this.getView();

			// create value help dialog

			if (!this._createPlayers) {
				this._createPlayers = Fragment.load({
					id: oView.getId(),
					name: "padelmasterdetail.view.fragments.CreatePlayer",
					controller: this
				},

				).then(function (oCreateDialog) {
					oView.addDependent(oCreateDialog); // El addDependent es como unir el dialogo a su Vista ( siempre hay que hacerlo) al crear el fragmento
					return oCreateDialog;

				});
			}
			//open value help dialog
			this._createPlayers.then(function (oCreateDialog) {
				oCreateDialog.open();
			})

		},

		//FUNCION PARA CREAR JUGADOR CUANDO PULSAMOS CREAR EN EL DIALOGO
		onCreatePlayer: function () {

			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

			//Creamos esta variable para tenerla para luego poder acceder al modelo y a la vista a traves del oModel
			var oModel = this.getView().getModel("jugadoresPadel");

			// Creamos un objeto donde guardaremos las propiedades recogidas
			var newPlayer = {

				estadisticas: {}

			};

			//Variables

			var aPlayers = oModel.getProperty("/jugadores");

			var sIdPlayer = aPlayers.length;
			var sName = this.getView().byId("idNameCreate").getValue();
			var sAge = parseInt(this.getView().byId("idInputCrearEdat").getValue());
			var sCity = this.getView().byId("idInputCrearCity").getValue();
			var sLevel = parseFloat(this.getView().byId("idInputCrearLevel").getValue());
			var sGenre = this.getView().byId("idCreateGenre").getSelectedItem().getKey();
			var sHand = this.getView().byId("idCreateHand").getSelectedItem().getKey();
			var sDescription = this.getView().byId("idInputCrearDescription").getValue();
			var sHeight = parseInt(this.getView().byId("idInputCrearHeight").getValue());
			var sWeight = parseInt(this.getView().byId("idInputCrearWeight").getValue());
			var sTypeRacket = this.getView().byId("idTypeRacket").getSelectedItem().getKey();
			var sTypeGrip = this.getView().byId("idTypeGrip").getSelectedItem().getKey();
			var sPositionPlayer = this.getView().byId("idPosition").getSelectedItem().getKey();
			var sGamesPlayed = parseInt(this.getView().byId("idInputGamesPlayed").getValue());
			var sGamesWon = parseInt(this.getView().byId("idInputGamesWon").getValue());

			if (sName === "") {
				sap.m.MessageBox.warning("name is Required");
				return;
			}

			else if (!sAge) {
				sap.m.MessageBox.warning("Age is Required");
				return;
			}

			else if (!sCity) {
				sap.m.MessageBox.warning("City is Required");
				return;
			}

			else if (!sLevel) {
				sap.m.MessageBox.warning("Level is Required");
				return;
			}

			else if (!sCity) {
				sap.m.MessageBox.warning("City is Required");
				return;
			}


			newPlayer.id = sIdPlayer
			newPlayer.nombre = sName;
			newPlayer.edad = sAge;
			newPlayer.poblacion = sCity;
			newPlayer.nivel = sLevel;
			newPlayer.sexo = sGenre;
			newPlayer.mano = sHand;
			newPlayer.Descripcion = sDescription;
			newPlayer.altura = sHeight;
			newPlayer.peso = sWeight;
			newPlayer.tipo_raqueta = sTypeRacket;
			newPlayer.tipo_grip = sTypeGrip;
			newPlayer.posicion_cancha = sPositionPlayer;
			//ESTADISTICAS
			newPlayer.estadisticas.nivel = sLevel;
			newPlayer.estadisticas.num_partidos_jugados = sGamesPlayed;
			newPlayer.estadisticas.num_partidos_ganados = sGamesWon;

			// 1. Obtén una referencia al modelo JSON actual
			var oModel = this.getView().getModel("jugadoresPadel");

			//Obtener la lista de jugadores

			var aPlayers = oModel.getProperty("/jugadores");


			//Añadimos el nuevo jugador a la lista
			aPlayers.push(newPlayer);

			//Actualiza la propiedad "players" en el modelo JSON:
			oModel.setProperty("/jugadores", aPlayers);


			this.getView().getModel().refresh(true);

			oModel.updateBindings();
			this.onCloseDialogCreatePlayer();

		},

		resetDialogCreatePlayer: function () {

			//Reseteamos los valores
			this.getView().byId("idJugadorCreate").setValue("");
			this.getView().byId("idNameCreate").setValue("");
			this.getView().byId("idInputCrearEdat").setValue("");
			this.getView().byId("idInputCrearCity").setValue("");
			this.getView().byId("idInputCrearLevel").setValue("");
			this.getView().byId("idCreateGenre").setSelectedItem();
			this.getView().byId("idCreateHand").setSelectedItem();
			this.getView().byId("idInputCrearDescription").setValue("");
			this.getView().byId("idInputCrearHeight").setValue("");
			this.getView().byId("idInputCrearWeight").setValue("");
			this.getView().byId("idTypeRacket").setSelectedItem();
			this.getView().byId("idTypeGrip").setSelectedItem();
			this.getView().byId("idPosition").setSelectedItem();
			this.getView().byId("idInputGamesPlayed").setValue("");
			this.getView().byId("idInputGamesWon").setValue("");

		},

		onCloseDialogCreatePlayer: function () {

			this.resetDialogCreatePlayer();
			this._createPlayers.then(function (oCreateDialog) {
				oCreateDialog.close();
			})
		},

		onPlayerSelected: function (oEvent) {
			this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");

			var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
			

			if (oItem) {
				var sPath = oItem.getBindingContextPath();
				var sPlayerId = sPath.split("/").pop();
				this.oRouter.navTo("playerDetail", {
					playerId: sPlayerId
				});
			}
		},

		_onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments");
			var oView = this.getView();
			var sPlayerId = oArgs.playerId;
			

			oView.bindElement({
				path: "/jugadores(" + sPlayerId + ")",
				model: "jugadoresPadel"
			});
		},


	});
});
