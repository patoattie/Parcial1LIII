addEventListener("load", asignarManejadores, false);

var personajes = [];
var personajeSeleccionado = {};

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

                //document.getElementById("btnGetPersonajes").removeAttribute("disabled");
                //document.getElementById("btnAltaPersonaje").removeAttribute("disabled");
                document.getElementById("btnGetPersonajes").style.pointerEvents = "auto";
                document.getElementById("btnAltaPersonaje").style.pointerEvents = "auto";
            }
        }
        else
        {
            //document.getElementById("btnGetPersonajes").setAttribute("disabled", "");
            //document.getElementById("btnAltaPersonaje").setAttribute("disabled", "");
            //document.getElementById("btnEditarPersonaje").setAttribute("disabled", "");
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
        var atributoCapitalizado = atributo.charAt(0).toUpperCase() + atributo.slice(1).toLowerCase(); //Primer letra en mayuscula, resto minuscula
        personaje[atributo] = document.getElementById("txt" + atributoCapitalizado).value;
    }

    return personaje;
}

//Llama a la función altaPersonaje del servidor, pasándole el objeto que se quiere agregar por parámetro.
function agregarPersonaje(personaje)
{
    var xhr = new XMLHttpRequest();
    var nuevaPersona = [];
    var spinner = crearSpinner();

    xhr.onreadystatechange = function()
    {
        if (this.readyState == XMLHttpRequest.DONE)
        {
            if (this.status == 200)
            {
                info.removeChild(spinner);
                nuevaPersona.push(JSON.parse(xhr.responseText));
                ocultarFormulario();
                crearDetalle(document.getElementById("tablaPersonajes"), nuevaPersona);
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

//Llama a la función bajaPersona del servidor, pasándole el objeto que se quiere eliminar por parámetro.
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
                    alert("Personaje:\n\n" + personaToString(personaje) + "\n\nfue borrada de la tabla");
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

    xhr.open('POST', 'http://localhost:3000/bajaPersona', true); //abre la conexion( metodo , URL, que sea asincronico y no se quede esperando el retorno)
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(personaje));

    // con POST LOS DATOS PASAR POR SEND
}

//Llamador usado por el evento dla opción de Modificar del formulario
function opcionModificarPersona()
{
    modificarPersona(personajeSeleccionado, personajeEditado());
}

//Llama a la función modificarPersona del servidor, pasándole el objeto que se quiere modificar por parámetro.
function modificarPersona(personaPre, personaPost)
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
                    alert("Personaje:\n\n" + personaToString(personaPre) + "\n\nfue modificada a:\n\n" + personaToString(personaPost));
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

    xhr.open('POST', 'http://localhost:3000/modificarPersona', true); //abre la conexion( metodo , URL, que sea asincronico y no se quede esperando el retorno)
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(personaPost));

    // con POST LOS DATOS PASAR POR SEND
}

//Devuelve un string con la descripción de atributos y valores del objeto pasado por parámetro.
function personaToString(personaje)
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

        texto += atributo.toUpperCase() + ": " + personaje[atributo];
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
        personajes[0] = {"id":null,"nombre":null,"apellido":null,"edad":null,"casa":null,"es traidor":null};
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
    //var tablaFormulario = document.createElement("table");
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
    //grupo.appendChild(tablaFormulario);

    leyenda.textContent = "Personaje";

    for(var atributo in personajes[0])
    {
        //var fila = document.createElement("tr");
        //var columnaEtiqueta = document.createElement("td");
        //var columnaTexto = document.createElement("td");
        var etiqueta = document.createElement("label");
        var atributoCapitalizado = atributo.charAt(0).toUpperCase() + atributo.slice(1).toLowerCase(); //Primer letra en mayuscula, resto minuscula
        var cuadroTexto = document.createElement("input");

        //tablaFormulario.appendChild(fila);

        //fila.appendChild(columnaEtiqueta);
        //fila.appendChild(columnaTexto);

        etiqueta.setAttribute("for", "txt" + atributoCapitalizado);
        etiqueta.textContent = atributoCapitalizado + ": ";

        cuadroTexto.setAttribute("type", "text");
        cuadroTexto.setAttribute("id", "txt" + atributoCapitalizado);
        if(atributo === "id")
        {
            cuadroTexto.setAttribute("readonly", "");
        }

        //columnaEtiqueta.appendChild(etiqueta);
        grupo.appendChild(etiqueta);

        //columnaTexto.appendChild(cuadroTexto);
        grupo.appendChild(cuadroTexto);
    }

    botonAgregar.setAttribute("type", "button");
    botonAgregar.setAttribute("id", "btnAgregar");
    botonAgregar.value = "Agregar";
    botonAgregar.addEventListener("click", opcionAgregarPersona, false);

    botonModificar.setAttribute("type", "button");
    botonModificar.setAttribute("id", "btnModificar");
    botonModificar.value = "Modificar";
    botonModificar.addEventListener("click", opcionModificarPersona, false);

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
            columna.textContent = datos[i][atributo];
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
        personajeSeleccionado[this.childNodes[i].getAttribute("class")] = this.childNodes[i].textContent;
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
        filaSeleccionada.childNodes[i].textContent = datos[filaSeleccionada.childNodes[i].getAttribute("class")];
    }
}

//Oculta la tabla de personajes, y muestra el formulario invocando la función pertinente
//sin parámetro. Lo invoca la opción de Alta del menú
function altaPersonaje()
{
    activarMenu(document.getElementById("btnAltaPersonaje"));

    //document.getElementById("btnAltaPersonaje").setAttribute("disabled", "");
    //document.getElementById("btnEditarPersonaje").setAttribute("disabled", "");
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

    //document.getElementById("btnAltaPersonaje").setAttribute("disabled", "");
    //document.getElementById("btnEditarPersonaje").setAttribute("disabled", "");
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

        if(typeof datos == "object")
        {
            document.getElementById("txt" + atributoCapitalizado).value = datos[atributo];
        }
        else
        {
            document.getElementById("txt" + atributoCapitalizado).value = "";
        }
    }
}

//Oculta el formulario de edición y muestra la tabla de personajes.
//Se blanquea cualquier fila que se haya previamente seleccionado.
function ocultarFormulario()
{
    activarMenu(document.getElementById("btnGetPersonajes"));

    //document.getElementById("btnAltaPersonaje").removeAttribute("disabled");
    //document.getElementById("btnEditarPersonaje").setAttribute("disabled", "");
    document.getElementById("btnAltaPersonaje").style.pointerEvents = "auto";
    document.getElementById("btnEditarPersonaje").style.pointerEvents = "none";

    blanquearFila();

    document.getElementById("tablaPersonajes").style.display = "table";
    document.getElementById("formularioPersonajes").style.display = "none";
}