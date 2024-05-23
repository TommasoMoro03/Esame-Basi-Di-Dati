from fastapi import FastAPI, WebSocket
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import mysql.connector
from typing import List
from datetime import datetime, date
import decimal
import json

app = FastAPI()
#riga necessaria altrimenti il CSS non funziona
app.mount("/static", StaticFiles(directory="static"), name="static")

# connessione al database
def get_db_connection():
    return mysql.connector.connect(
        host="***",
        user="***",
        password="***",
        database="torneoBasket"
    )

# funzione per convertire il risultato della query in un formato serializzabile,
# perché i tipi datetime, time e decimal danno problemi con JSON
def serialize_result(result):
    serialized_result = []
    for row in result:
        serialized_row = []
        for value in row:
            if isinstance(value, datetime):
                serialized_row.append(value.isoformat())
            elif isinstance(value, date):
                serialized_row.append(value.isoformat())
            elif isinstance(value, decimal.Decimal):
                serialized_row.append(float(value))
            else:
                serialized_row.append(value)
        serialized_result.append(serialized_row)
    return serialized_result

# eseguo la stored procedure scelta
def esegui_stored_procedure(nome_procedura, parametro=None):
    try:
        mydb = get_db_connection()
        cursor = mydb.cursor()
        if parametro:
            cursor.execute(f"CALL {nome_procedura}('{parametro}');")
        else:
            cursor.execute(f"CALL {nome_procedura};")
        result = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        cursor.close()
        mydb.close()
        serialized_result = serialize_result(result)
        return {"columns": columns, "results": serialized_result}
    except mysql.connector.Error as err:
        return {"error": str(err)}
    except Exception as e:
        return {"error": str(e)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_json()
        procedure_name = data["procedure"]
        parametro = data.get("parametro")
        result = esegui_stored_procedure(procedure_name, parametro)
        await websocket.send_json(result)

@app.get("/", response_class=HTMLResponse)
async def read_root():
    return FileResponse("templates/index.html")
