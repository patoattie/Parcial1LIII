addEventListener("load", asignarManejadores, false);

var personajes = [];
var personajeSeleccionado = {};
var casas = ["Stark", "Targaryen", "Lannister"];

//Al dispararse el evento load cuando se termina de cargar la página web, 
//se instancian los manejadores del evento click de los tres botones del menú.
function asignarManejadores()
{
    document.getElementById("btnGetPersonajes").addEventListener("click", traerPersonajes, false);
    document.getElementById("btnAltaPersonaje").addEventListener("click", altaPersonaje, false);
    document.getElementById("btnEditarPersonaje").addEventListener("click", editarPersonaje, false);
}

//Crea en el DOM el spinner que se utiliza para la espera de la respuesta del servidor.
//Si el mismo ya está creado, entonces solamente lo instancia.
function crearSpinner()
{
    var spinner = document.getElementById("spinner");
    
    if(!spinner) //Si el spinner no está creado en el DOM
    {
        spinner = document.createElement("img");
        spinner.setAttribute("src", "image/preloader.gif");
        spinner.setAttribute("alt", "Espere mientras se procesa la petición...");
        spinner.setAttribute("height", "48px");
        spinner.setAttribute("width", "48px");
        spinner.setAttribute("id", "spinner");
    }

    return spinner;
}

function activarMenu(elemento)
{
    if(document.getElementsByClassName("active")[0])
    {
        document.getElementsByClassName("active")[0].removeAttribute("class");
    }
    elemento.setAttribute("class", "active");
}

//Llama a la función traerPersonajes del servidor, luego con los datos devueltos se crean en el DOM la tabla y el formulario de edición.
function traerPersonajes()
{
    var xhr = new XMLHttpRequest();
    var info = document.getElementById("info");
    var spinner = crearSpinner();

    info.innerHTML = "";

    activarMenu(document.getElementById("btnGetPersonajes"));

    xhr.onreadystatechange = function() //0 al 4 son los estados, 4 es el estado DONE
    {
        if(this.readyState == XMLHttpRequest.DONE) //XMLHttpRequest.DONE = 4
        {
            if(this.status == 200) // Estado OK
            {
                info.innerHTML = "";

                personajes = JSON.parse(this.responseText); //Respuesta de texto del servidor (JSON), lo convierto a objeto

                crearTabla();
                crearFormulario();

                document.getElementById("btnGetPersonajes").style.pointerEvents = "auto";
                document.getElementById("btnAltaPersonaje").style.pointerEvents = "auto";
            }
        }
        else
        {
            document.getElementById("btnGetPersonajes").style.pointerEvents = "none";
            document.getElementById("btnAltaPersonaje").style.pointerEvents = "none";
            document.getElementById("btnEditarPersonaje").style.pointerEvents = "none";
    
            info.appendChild(spinner);
        }
    };

    xhr.open("GET", "http://localhost:3000/traerPersonajes", true); // true para que sea asincronico, debe ir el protocolo en forma explicita
    xhr.send(); //se envia la peticion al servidor
}

//Llamador usado por el evento dla opción de Agregar del formulario
function opcionAgregarPersonaje()
{
    agregarPersonaje(personajeEditado());
}

//Crea un objeto JSON a partir de los datos del formulario
function personajeEditado()
{
    var personaje = {};

    for(var atributo in personajes[0])
    {
        switch(atributo)
        {
            case "casa":
                for(var i = 0; i < casas.length; i++)
                {
                    if(document.getElementById("opt" + casas[i]).checked)
                    {
                        personaje["casa"] = casas[i];
                    }
                }
                break;
            case "traidor":
                personaje["traidor"] = document.getElementById("chkTraidor").checked;
                break;
            default:
                var atributoCapitalizado = atributo.charAt(0).toUpperCase() + atributo.slice(1).toLowerCase(); //Primer letra en mayuscula, resto minuscula
                personaje[atributo] = document.getElementById("txt" + atributoCapitalizado).value;

                break;
        }
    }

    return personaje;
}

//Llama a la función altaPersonaje del servidor, pasándole el objeto que se quiere agregar por parámetro.
function agregarPersonaje(personaje)
{
    var xhr = new XMLHttpRequest();
    var nuevoPersonaje = [];
    var spinner = crearSpinner();

    xhr.onreadystatechange = function()
    {
        if (this.readyState == XMLHttpRequest.DONE)
        {
            if (this.status == 200)
            {
                info.removeChild(spinner);
                nuevoPersonaje.push(JSON.parse(xhr.responseText));
                ocultarFormulario();
                crearDetalle(document.getElementById("tablaPersonajes"), nuevoPersonaje);
            }
            else
            {
                console.log("error: " + xhr.status);
            }

        }
        else
        {
            info.appendChild(spinner);
        }

    };

    xhr.open('POST', 'http://localhost:3000/altaPersonaje', true); //abre la conexion( metodo , URL, que sea asincronico y no se quede esperando el retorno)
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(personaje));

    // con POST LOS DATOS PASAR POR SEND
}

//Llamador usado por el evento dla opción de Borrar del formulario
function opcionBorrarPersonaje()
{
    borrarPersonaje(personajeSeleccionado);
}

//Llama a la función bajaPersonaje del servidor, pasándole el objeto que se quiere eliminar por parámetro.
function borrarPersonaje(personaje)
{
    var xhr = new XMLHttpRequest();
    var spinner = crearSpinner();

    xhr.onreadystatechange = function()
    {
        if (this.readyState == XMLHttpRequest.DONE)
        {
            if (this.status == 200)
            {
                var respuesta = JSON.parse(xhr.responseText);
                info.removeChild(spinner);

                if(respuesta.todoOk === 1)
                {
                    alert("Personaje:\n\n" + personajeToString(personaje) + "\n\nfue borrada de la tabla");
                    borrarFilaSeleccionada(document.getElementById("tablaPersonajes"));
                }
                else
                {
                    alert("Error al borrar personaje. No se hicieron cambios");
                }

                ocultarFormulario();
            }
            else
            {
                console.log("error: " + xhr.status);
            }

        }
        else
        {
            info.appendChild(spinner);
        }

    };

    xhr.open('POST', 'http://localhost:3000/bajaPersonaje', true); //abre la conexion( metodo , URL, que sea asincronico y no se quede esperando el retorno)
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(personaje));

    // con POST LOS DATOS PASAR POR SEND
}

//Llamador usado por el evento dla opción de Modificar del formulario
function opcionModificarPersonaje()
{
    modificarPersonaje(personajeSeleccionado, personajeEditado());
}

//Llama a la función modificarPersonaje del servidor, pasándole el objeto que se quiere modificar por parámetro.
function modificarPersonaje(personaPre, personaPost)
{
    var xhr = new XMLHttpRequest();
    var spinner = crearSpinner();

    xhr.onreadystatechange = function()
    {
        if (this.readyState == XMLHttpRequest.DONE)
        {
            if (this.status == 200)
            {
                var respuesta = JSON.parse(xhr.responseText);
                info.removeChild(spinner);

                if(respuesta.todoOk === 1)
                {
                    alert("Personaje:\n\n" + personajeToString(personaPre) + "\n\nfue modificada a:\n\n" + personajeToString(personaPost));
                    modificarFilaSeleccionada(personaPost);
                }
                else
                {
                    alert("Error al modificar personaje. No se hicieron cambios");
                }

                ocultarFormulario();
            }
            else
            {
                console.log("error: " + xhr.status);
            }

        }
        else
        {
            info.appendChild(spinner);
        }

    };

    xhr.open('POST', 'http://localhost:3000/modificarPersonaje', true); //abre la conexion( metodo , URL, que sea asincronico y no se quede esperando el retorno)
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(personaPost));

    // con POST LOS DATOS PASAR POR SEND
}

//Devuelve un string con la descripción de atributos y valores del objeto pasado por parámetro.
function personajeToString(personaje)
{
    var texto = "";
    var retornoCarro = false;

    for(var atributo in personaje)
    {
        if(retornoCarro) //Para que no haga retorno de carro en la primera línea
        {
            texto += "\n";
        }
        else
        {
            retornoCarro = true;
        }

        if(atributo == "traidor" && personaje[atributo])
        {
            texto += atributo.toUpperCase() + ": Si";
        }
        else if(atributo == "traidor" && !personaje[atributo])
        {
            texto += atributo.toUpperCase() + ": No";
        }
        else
        {
            texto += atributo.toUpperCase() + ": " + personaje[atributo];
        }
    }

    return texto;
}

//Crea la tabla de personajes en el div info
function crearTabla()
{
    var tablaPersonajes = document.createElement("table");
    var puedeCrearDetalle = true; //Si no tengo elementos desde el servidor cambia a false.
    var div = document.getElementById("info");

    tablaPersonajes.setAttribute("border", "1px");
    tablaPersonajes.style.borderCollapse = "collapse"
    tablaPersonajes.setAttribute("id", "tablaPersonajes");
    tablaPersonajes.setAttribute("class", "tablaPersonajes");
    div.appendChild(tablaPersonajes);

    if(typeof personajes[0] != "object") //Si el servidor no trae nada creo la estructura vacía.
    {
        personajes[0] = {"id":null,"nombre":null,"apellido":null,"edad":null,"casa":null,"traidor":null};
        puedeCrearDetalle = false;
    }

    crearCabecera(tablaPersonajes);

    if(puedeCrearDetalle)
    {
        crearDetalle(tablaPersonajes, personajes);
    }
}

//Crea el formulario de edición de personajes en el div info.
//El atributo id lo crea como solo lectura, ya que el servidor en el alta lo deduce,
//y en la modificación no se altera su valor.
function crearFormulario()
{
    var div = document.getElementById("info");
    var formulario = document.createElement("form");
    var grupo = document.createElement("fieldset");
    var leyenda = document.createElement("legend");
    var botonAgregar = document.createElement("input");
    var botonModificar = document.createElement("input");
    var botonBorrar = document.createElement("input");
    var botonCancelar = document.createElement("input");

    formulario.setAttribute("action", "#");
    formulario.setAttribute("id", "formularioPersonajes");
    formulario.style.display = "none";

    div.appendChild(formulario);

    formulario.appendChild(grupo);

    grupo.appendChild(leyenda);

    leyenda.textContent = "Personaje";

    for(var atributo in personajes[0])
    {
        switch(atributo)
        {
            case "casa":
                var grupoCasa = document.createElement("fieldset");
                var leyendaCasa = document.createElement("legend");

                grupo.appendChild(grupoCasa);
                grupoCasa.appendChild(leyendaCasa);
                grupoCasa.setAttribute("class", "grupoInterno");
                leyendaCasa.textContent = "Casa";

                for(var i = 0; i < casas.length; i++)
                {
                    var etiquetaCasa = document.createElement("label");
                    var optButton = document.createElement("input");

                    etiquetaCasa.setAttribute("for", "opt" + casas[i]);
                    etiquetaCasa.textContent = casas[i];

                    optButton.setAttribute("type", "radio");
                    optButton.setAttribute("id", "opt" + casas[i]);
                    optButton.setAttribute("name", "casa");
                    optButton.setAttribute("value", casas[i]);
                    optButton.textContent = " " + casas[i];

                    grupoCasa.appendChild(optButton);
                    grupoCasa.appendChild(etiquetaCasa);
                    grupoCasa.appendChild(document.createElement("br"));
                }

                break;

            case "traidor":
                var grupoTraidor = document.createElement("fieldset");
                var chkTraidor = document.createElement("input");
                var etiquetaTraidor = document.createElement("label");

                grupoTraidor.setAttribute("class", "grupoInterno");

                grupo.appendChild(grupoTraidor);

                chkTraidor.setAttribute("type", "checkbox");
                chkTraidor.setAttribute("id", "chkTraidor");
                chkTraidor.setAttribute("name", "traidor");
                chkTraidor.setAttribute("value", "traidor");
                chkTraidor.textContent = "Es Traidor";

                etiquetaTraidor.setAttribute("for", "chkTraidor");
                etiquetaTraidor.textContent = "Es Traidor";

                grupoTraidor.appendChild(etiquetaTraidor);
                grupoTraidor.appendChild(chkTraidor);
    
                break;

            default:
                var cuadroTexto = document.createElement("input");
                var etiqueta = document.createElement("label");
                var atributoCapitalizado = atributo.charAt(0).toUpperCase() + atributo.slice(1).toLowerCase(); //Primer letra en mayuscula, resto minuscula
        
                etiqueta.setAttribute("for", "txt" + atributoCapitalizado);
                etiqueta.textContent = atributoCapitalizado + ": ";
                        
                cuadroTexto.setAttribute("type", "text");
                cuadroTexto.setAttribute("id", "txt" + atributoCapitalizado);

                if(atributo === "id")
                {
                    cuadroTexto.setAttribute("readonly", "");
                }
                
                grupo.appendChild(etiqueta);
                grupo.appendChild(cuadroTexto);

                break;
        }
    }

    botonAgregar.setAttribute("type", "button");
    botonAgregar.setAttribute("id", "btnAgregar");
    botonAgregar.value = "Agregar";
    botonAgregar.addEventListener("click", opcionAgregarPersonaje, false);

    botonModificar.setAttribute("type", "button");
    botonModificar.setAttribute("id", "btnModificar");
    botonModificar.value = "Modificar";
    botonModificar.addEventListener("click", opcionModificarPersonaje, false);

    botonBorrar.setAttribute("type", "button");
    botonBorrar.setAttribute("id", "btnBorrar");
    botonBorrar.value = "Borrar";
    botonBorrar.addEventListener("click", opcionBorrarPersonaje, false);

    botonCancelar.setAttribute("type", "button");
    botonCancelar.setAttribute("id", "btnCancelar");
    botonCancelar.value = "Cancelar";
    botonCancelar.addEventListener("click", ocultarFormulario, false);

    grupo.appendChild(botonAgregar);
    grupo.appendChild(botonModificar);
    grupo.appendChild(botonBorrar);
    grupo.appendChild(botonCancelar);
}

//Crea la fila de cabecera, con tantas columnas como atributos posea la personaje, en la tabla de personajes.
function crearCabecera(tablaPersonajes)
{
    var filaCabecera = document.createElement("tr");
    var columna;
    tablaPersonajes.appendChild(filaCabecera);
    for(var atributo in personajes[0])
    {
        columna = document.createElement("th");
        columna.textContent = atributo;
        filaCabecera.appendChild(columna);
    }
}

//Crea tantas fila de detalle en la tabla de personajes como personajes haya cargadas.
function crearDetalle(tablaPersonajes, datos)
{
    for(var i = 0; i < datos.length; i++)
    {
        var filaDetalle = document.createElement("tr");
        var atributo;
        var columna;
        filaDetalle.addEventListener("click", seleccionarFila, false);
        tablaPersonajes.appendChild(filaDetalle);

        for(atributo in datos[i])
        {
            columna = document.createElement("td");
            columna.setAttribute("class", atributo);

            if(atributo == "traidor")
            {
                if(datos[i][atributo])
                {
                    columna.textContent = "Si";
                }
                else
                {
                    columna.textContent = "No";
                }
            }
            else
            {
                columna.textContent = datos[i][atributo];
            }

            filaDetalle.appendChild(columna);
        }
    }
}

//Cuando el usuario hace click en una fila de detalle de la tabla de personajes,
//la función le setea, previo a blanquear si hay otra fila antes seleccionada, 
//el atributo id a la fila y carga la personaje en el array de personaje seleccionada.
function seleccionarFila()
{
    //document.getElementById("btnEditarPersonaje").removeAttribute("disabled");
    document.getElementById("btnEditarPersonaje").style.pointerEvents = "auto";
    blanquearFila();
    
    this.setAttribute("id", "filaSeleccionada");

    //Recorro las columnas de la fila seleccionada, guardando un atributo por columna en personajeSeleccionado.
    for(var i = 0; i < this.childNodes.length; i++)
    {
        if(this.childNodes[i].getAttribute("class") == "traidor")
        {
            personajeSeleccionado[this.childNodes[i].getAttribute("class")] = (this.childNodes[i].textContent == "Si");
        }
        else
        {
            personajeSeleccionado[this.childNodes[i].getAttribute("class")] = this.childNodes[i].textContent;
        }
    }
}

//Quita el atributo id de la fila seleccionada.
function blanquearFila()
{
    var filaSeleccionada = document.getElementById("filaSeleccionada");

    if(filaSeleccionada) //Si hay una fila seleccionada, le quito el id
    {
        filaSeleccionada.removeAttribute("id");
    }
}

//Elimina de la tabla de personajes la fila seleccionada por el usuario.
//Esta función la invoca la opción de borrar una personaje del servidor,
//una vez devuelto el ok del mismo.
function borrarFilaSeleccionada(tabla)
{
    tabla.removeChild(document.getElementById("filaSeleccionada"));
}

//Modifica los datos de la fila seleccionada con los datos de la personaje pasada por parámetro.
//Esta función la invoca la opción de modificar una personaje del servidor,
//una vez devuelto el ok del mismo.
function modificarFilaSeleccionada(datos)
{
    var filaSeleccionada = document.getElementById("filaSeleccionada");

    //Recorro las columnas de la fila seleccionada, guardando un atributo por columna en personajeSeleccionado.
    for(var i = 0; i < filaSeleccionada.childNodes.length; i++)
    {
        if(filaSeleccionada.childNodes[i].getAttribute("class") == "traidor")
        {
            if(datos[filaSeleccionada.childNodes[i].getAttribute("class")])
            {
                filaSeleccionada.childNodes[i].textContent = "Si";
            }
            else
            {
                filaSeleccionada.childNodes[i].textContent = "No";
            }
        }
        else
        {
            filaSeleccionada.childNodes[i].textContent = datos[filaSeleccionada.childNodes[i].getAttribute("class")];
        }
    }
}

//Oculta la tabla de personajes, y muestra el formulario invocando la función pertinente
//sin parámetro. Lo invoca la opción de Alta del menú
function altaPersonaje()
{
    activarMenu(document.getElementById("btnAltaPersonaje"));

    document.getElementById("btnAltaPersonaje").style.pointerEvents = "none";
    document.getElementById("btnEditarPersonaje").style.pointerEvents = "none";

    document.getElementById("tablaPersonajes").style.display = "none";
    document.getElementById("formularioPersonajes").style.display = "initial";

    mostrarFormulario();
}

//Oculta la tabla de personajes, y muestra el formulario invocando la función pertinente
//pasándole por parámetro la personaje que se quiere editar. Lo invoca la opción de Editar del menú
function editarPersonaje()
{
    activarMenu(document.getElementById("btnEditarPersonaje"));

    document.getElementById("btnAltaPersonaje").style.pointerEvents = "none";
    document.getElementById("btnEditarPersonaje").style.pointerEvents = "none";

    document.getElementById("tablaPersonajes").style.display = "none";
    document.getElementById("formularioPersonajes").style.display = "initial";

    mostrarFormulario(personajeSeleccionado);
}

//Arma el formulario de edición de personajes.
//Si no se le pasa parámetro asume que se trata de un alta, para ello muestra la opción
//que invoca la función de alta en el servidor y los cuadros de texto de los parámetros
//en blanco.
//Si se invoca con un objeto, la función asume modificación o baja de la personaje que viene
//por parámetro, mostrando los botones que invocan las funciones respectivas en el servidor,
//y completa los cuadros de texto con los valores de cada atributo.
function mostrarFormulario()
{
    var datos;

    if(typeof arguments[0] == "object") //Es de tipo object si vino un argumento en los parámetros formales de la función.
    {
        datos = arguments[0];

        document.getElementById("btnAgregar").style.display = "none";
        document.getElementById("btnModificar").style.display = "initial";
        document.getElementById("btnBorrar").style.display = "initial";
    }
    else
    {
        document.getElementById("btnAgregar").style.display = "initial";
        document.getElementById("btnModificar").style.display = "none";
        document.getElementById("btnBorrar").style.display = "none";
    }

    for(var atributo in personajes[0])
    {
        var atributoCapitalizado = atributo.charAt(0).toUpperCase() + atributo.slice(1).toLowerCase(); //Primer letra en mayuscula, resto minuscula

        switch(atributo)
        {
            case "casa":
                if(typeof datos == "object") //Modificar o Borrar
                {
                    for(var i = 0; i < casas.length; i++)
                    {
                        if(casas[i] == datos[atributo])
                        {
                            document.getElementById("opt" + casas[i]).checked = true;
                        }
                        else
                        {
                            document.getElementById("opt" + casas[i]).checked = false;
                        }
                    }
                }
                else //Agregar
                {
                    for(var i = 0; i < casas.length; i++)
                    {
                        if(i == 0)
                        {
                            document.getElementById("opt" + casas[i]).checked = true;
                        }
                        else
                        {
                            document.getElementById("opt" + casas[i]).checked = false;
                        }
                    }
                }
                break;
                
                case "traidor":
                    if(typeof datos == "object")
                    {
                        document.getElementById("chkTraidor").checked = datos[atributo];
                    }
                    else
                    {
                        document.getElementById("chkTraidor").checked = false;
                    }
                    break;
                    
                default:
                    if(typeof datos == "object")
                    {
                        document.getElementById("txt" + atributoCapitalizado).value = datos[atributo];
                    }
                    else
                    {
                        document.getElementById("txt" + atributoCapitalizado).value = "";
                    }
                    break;
        }
    }
}

//Oculta el formulario de edición y muestra la tabla de personajes.
//Se blanquea cualquier fila que se haya previamente seleccionado.
function ocultarFormulario()
{
    activarMenu(document.getElementById("btnGetPersonajes"));

    document.getElementById("btnAltaPersonaje").style.pointerEvents = "auto";
    document.getElementById("btnEditarPersonaje").style.pointerEvents = "none";

    blanquearFila();

    document.getElementById("tablaPersonajes").style.display = "table";
    document.getElementById("formularioPersonajes").style.display = "none";
}