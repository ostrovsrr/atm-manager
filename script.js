"use strict";

const sideBar = document.querySelector(".sidebar");
const list = document.querySelector(".branches");
const form = document.querySelector(".form");
const sortDistanceBtn = document.querySelector(".sort__distance__btn");
const sortNameBtn = document.querySelector(".sort__name__btn");
const sortBalanceBtn = document.querySelector(".sort__balance__btn");
const sortStatusBtn = document.querySelector(".sort__status__btn");
const createBranchBtn = document.querySelector(".create__branch__btn");
const deleteBranchSymbol = document.querySelector(".delete__branch__symbol");

// REMOVE AFTERWARDS --- Manual Creation of branches for tests
// let counter = 0;
// const streetArr = [
//   "379 Ray Lawson Boulevard",
//   "1410 Trafalgar Road",
//   "400 Ray Lawson Boulevard",
// ];
// const balanceArr = [100, 2000, 150];
// const statusArr = [true, false, true];
// UP TO HERE

class Branch {
  constructor(number, balance, address, status) {
    this.number = number;
    this.id = `branch--${number}`;
    this.name = `Branch #${number}`;
    this.balance = balance;
    this.address = address;
    this.status = status;
    this.coords = [];
  }

  _setCoords(coords) {
    this.coords = coords;
  }

  _calcDistanceTo(latlng) {
    this.distanceToUserLocation = (
      latlng.distanceTo(this.coords) / 1000
    ).toFixed(2);
  }

  _setFullAddress(fullAddress) {
    this.fullAddress = fullAddress;
  }
}

class App {
  branches = [];
  markersGroup;
  map;
  userLocationCoords;

  constructor() {
    // Get Position, Load Map
    this._getLocation();

    // REMOVE AFTERWARDS --- Manual Creation of branches for tests
    // this._createBranch();
    // this._createBranch();
    // this._createBranch();
    // UP TO HERE

    // App event handlers:
    list.addEventListener("click", this._setViewOnPin.bind(this));
    form.addEventListener("submit", this._createBranch.bind(this));
    sortDistanceBtn.addEventListener("click", this._sortByDistance.bind(this));
    sortNameBtn.addEventListener("click", this._sortByName.bind(this));
    sortBalanceBtn.addEventListener("click", this._sortByBalance.bind(this));
    sortStatusBtn.addEventListener("click", this._sortByStatus.bind(this));
    createBranchBtn.addEventListener("click", this._toggleForm);
  }

  _getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        this._loadMap.bind(this)
      );
    }
  }

  _loadMap(position) {
    // Set Default Latitude and Longitude to Toronto Union Station For Testing Purposes
    let latitude = 43.6475057;
    let longitude = -79.3859694;
    // If user enables location usage
    if (position.coords) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    } else {
      alert(
        "Enable geolocation usage. The Default Location is set to Toronto Union Station."
      );
    }
    this.userLocationCoords = [latitude, longitude];
    this.map = L.map("map").setView(this.userLocationCoords, 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
    const userIcon = L.icon({
      iconUrl: "img/user.png",
      iconSize: [35, 35],
    });
    const meMarker = L.marker(this.userLocationCoords, { icon: userIcon });
    meMarker.addTo(this.map);
    this.markersGroup = L.featureGroup([meMarker]).addTo(this.map);

    // this.map.on("click", this._displayForm.bind(this));
  }

  _createBranch(e) {
    // DELETE THIS PEACE OF CODE AFTER TESTING
    // if (!e) {
    //   const branch = new Branch(
    //     this.branches.length + 1,
    //     balanceArr[counter],
    //     streetArr[counter],
    //     statusArr[counter]
    //   );
    //   this._convertAddressToCoords(branch);
    //   this._hideForm();
    //   this.branches.push(branch);
    //   counter++;
    //   return;
    // }
    // UP TO HERE
    e.preventDefault();
    const allNumbers = (...inputs) => inputs.every((input) => isFinite(input));

    const allPresent = (...inputs) => inputs.every((input) => input);

    const inputBalance = document.querySelector(".form__input--balance").value;
    const inputAddress = document.querySelector(".form__input--address").value;
    const inputStatus =
      document.querySelector(".form__input--status").value === "open"
        ? true
        : false;
    // data validation
    if (!allNumbers(inputBalance) || !allPresent(inputBalance, inputAddress))
      return alert("Please input legit info about the Branch");
    const branch = new Branch(
      this.branches.length + 1,
      inputBalance,
      inputAddress,
      inputStatus
    );
    this._convertAddressToCoords(branch);
    this._hideForm();
    this.branches.push(branch);
  }

  _displayBranchEl(branch) {
    const html = `
          <li class="branch" id="branch--${branch.number}">
          <span class="delete__branch__symbol">❌</span>
          <h2 class="branch__title">${branch.name}</h2>
          <p class="branch__address">${branch.fullAddress}</p>
            <div class="branch__details">
              <span class="branch__icon">📍</span>
              <span class="branch__value">${
                branch.distanceToUserLocation
              }</span>
              <span class="branch__unit">km</span>
            </div>

            <div class="branch__details">
            <span class="branch__icon">💰</span>
            <span class="branch__value">${branch.balance}</span>
            <span class="branch__unit">$</span>
          </div>

          <div class="branch__details">
          <span class="branch__icon">${branch.status ? "🟢" : "⛔"}</span>
          <span class="branch__value">${
            branch.status ? "Open" : "Closed"
          }</span>
        </div>
          </li>`;
    list.insertAdjacentHTML("beforeend", html);
  }

  _setViewOnPin(e) {
    // user Clicked on Delete Button
    if (e.target.classList.contains("delete__branch__symbol")) {
      this._deleteBranch(e);
      return;
    }

    // user clicked on li (branch) element
    const clickedBranchEl = e.target.closest(".branch");
    if (!clickedBranchEl) return;
    const branch = this.branches.find(
      (branch) => branch.id === clickedBranchEl.id
    );
    this.map.setView(L.latLng(...branch.coords), 15, { animate: true });
  }

  _deleteBranch(e) {
    const clickedBranchEl = e.target.closest(".branch");
    const branchIndex = this.branches.findIndex(
      (branch) => branch.id === clickedBranchEl.id
    );

    const deletedBranch = this.branches.at(branchIndex);

    // Remove marker from map
    // this.markersGroup.eachLayer(
    //   this._removeBankMarker.bind(this, deletedBranch)
    // );

    this.markersGroup.eachLayer(
      this._removeBankMarker.bind(this, deletedBranch)
    );

    // Remove branch out of the array
    this.branches.splice(branchIndex, 1);

    // Remove branch li element
    clickedBranchEl.remove();
  }

  _toggleForm() {
    form.classList.toggle("hidden");
  }

  _hideForm() {
    form.classList.add("hidden");
    // clear form inputs
    document.querySelector(".form__input--balance").value = "";
    document.querySelector(".form__input--address").value = "";
    document.querySelector(".form__input--status").value = "open";
  }

  _convertAddressToCoords(branch) {
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${branch.address}&format=json`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          let { lat, lon } = data[0];
          // Set full Address
          branch._setFullAddress(data[0].display_name);
          // Set coordinats of the address to the branch object
          branch._setCoords([lat, lon]);
          // Calculate distance from userLocation to branch
          branch._calcDistanceTo(L.latLng(...this.userLocationCoords));
          // Display Branch Element
          this._displayBranchEl(branch);
          // Add marker to the map
          this._addBankMarker(this.map, branch);
        } else {
          alert(`Please input the correct address`);
        }
      });
  }

  _addBankMarker(map, branch) {
    const bankIcon = L.icon({
      iconUrl: "img/bank-icon.png",
      iconSize: [35, 35],
    });
    const bankMarker = L.marker(branch.coords, { icon: bankIcon });
    bankMarker.addTo(map);
    this.markersGroup.addLayer(bankMarker);
  }

  _removeBankMarker(deletedBranch, marker) {
    if (
      marker.getLatLng().lat == deletedBranch.coords[0] &&
      marker.getLatLng().lng == deletedBranch.coords[1]
    ) {
      this.markersGroup.removeLayer(marker);
    }
  }

  _sortByDistance(e) {
    e.preventDefault();
    const branchesCopy = this.branches.slice();
    this.branches.sort(
      (a, b) => a.distanceToUserLocation - b.distanceToUserLocation
    );
    if (JSON.stringify(branchesCopy) === JSON.stringify(this.branches)) {
      this.branches.reverse();
    }
    this._updateBranchesUI();
  }

  _sortByName(e) {
    e.preventDefault();
    const branchesCopy = this.branches.slice();
    this.branches.sort((a, b) => a.number - b.number);
    if (JSON.stringify(branchesCopy) === JSON.stringify(this.branches)) {
      this.branches.reverse();
    }
    this._updateBranchesUI();
  }

  _sortByBalance(e) {
    e.preventDefault();
    const branchesCopy = this.branches.slice();
    this.branches.sort((a, b) => a.balance - b.balance);
    if (JSON.stringify(branchesCopy) === JSON.stringify(this.branches)) {
      this.branches.reverse();
    }
    this._updateBranchesUI();
  }

  _sortByStatus(e) {
    e.preventDefault();
    const branchesCopy = this.branches.slice();
    this.branches.sort((a, b) => b.status - a.status);
    if (JSON.stringify(branchesCopy) === JSON.stringify(this.branches)) {
      this.branches.reverse();
    }
    this._updateBranchesUI();
  }

  _updateBranchesUI() {
    // Delete All Branches Elements
    const branchEls = document.querySelectorAll(".branch");
    branchEls.forEach((branch) => branch.remove());

    // Display matching Branches Elements to branches array
    this.branches.forEach((branch) => this._displayBranchEl(branch));
  }
}

const app = new App();
