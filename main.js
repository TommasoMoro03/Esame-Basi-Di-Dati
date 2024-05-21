let socket;
 
function connectWebSocket() {
      socket = new WebSocket("ws://localhost:8000/ws");

      socket.onmessage = function(event) {
          const data = JSON.parse(event.data);
          if (data.error) {
              document.getElementById("result").innerHTML = `<p>${data.error}</p>`;
          } else {
              displayTable(data.columns, data.results);
          }
      };

      socket.onopen = function(event) {
          console.log("WebSocket connection established.");
      };

      socket.onclose = function(event) {
          console.log("WebSocket connection closed.");
      };

      socket.onerror = function(error) {
          console.log("WebSocket error:", error);
      };
  }

  function displayTable(columns, results) {
      let table = '<table border="1"><tr>';
      for (const column of columns) {
          table += `<th>${column}</th>`;
      }
      table += '</tr>';
      for (const row of results) {
          table += '<tr>';
          for (const cell of row) {
              table += `<td>${cell}</td>`;
          }
          table += '</tr>';
      }
      table += '</table>';
      document.getElementById("result").innerHTML = table;
  }

  function sendProcedureCall() {
      const select = document.getElementById("procedure-select");
      const procedureName = select.value;
      let parametro = null;

      if (procedureName === "StatisticheGiocatoriPerSquadra") {
          const squadraSelect = document.getElementById("squadra-select");
          parametro = squadraSelect.value;
      }
      if (procedureName === "DatePatentiniArbitri") {
          const patentiniInput = document.getElementById("num-patentini-input");
          parametro = patentiniInput.value;
      }
      if (procedureName === "GiocatorePerformante") {
          const giocatoriInput = document.getElementById("num-giocatori-input");
          parametro = giocatoriInput.value;
      }
      if (procedureName === "CalendarioPartitePalazzetto") {
          const palazzettoSelect = document.getElementById("palazzetto-select");
          parametro = palazzettoSelect.value;
      }
      const data = { procedure: procedureName, parametro: parametro };

      if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(data));
      }
  }

  function toggleInputs() {
      const select = document.getElementById("procedure-select");
      const squadraDropdown = document.getElementById("squadra-dropdown");
      const palazzettoDropdown = document.getElementById("palazzetto-dropdown");
      const numPatentiniInput = document.getElementById("num-patentini-input-div");
      const numGiocatoriInput = document.getElementById("num-giocatori-input-div");

      squadraDropdown.style.display = "none";
      palazzettoDropdown.style.display = "none";
      numPatentiniInput.style.display = "none";
      numGiocatoriInput.style.display = "none";

      if (select.value === "StatisticheGiocatoriPerSquadra") {
          squadraDropdown.style.display = "block";
      } else if (select.value === "CalendarioPartitePalazzetto") {
          palazzettoDropdown.style.display = "block";
      } else if (select.value === "DatePatentiniArbitri") {
          numPatentiniInput.style.display = "block";
      } else if (select.value === "GiocatorePerformante"){
          numGiocatoriInput.style.display = "block";
      }
  }

  window.onload = function() {
      connectWebSocket();
      document.getElementById("procedure-select").addEventListener("change", toggleInputs);
  };
