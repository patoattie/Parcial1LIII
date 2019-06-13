addEventListener("load", asignarManejadores, false);

var personas = [];
var personaSeleccionada = {};

//Al dispararse el evento load cuando se termina de cargar la página web, 
//se instancian los manejadores del evento click de los tres botones del menú.
function asignarManejadores()
{
    document.getElementById("btnGetPersona").addEventListener("click", traerPersonas, false);
    document.getElementById("btnAltaPersona").addEventListener("click", altaPersona, false);
    document.getElementById("btnEditarPersona").addEventListener("click", editarPersona, false);
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

//Llama a la función traerPersonas del servidor, luego con los datos devueltos se crean en el DOM la tabla y el formulario de edición.
function traerPersonas()
{
    var xhr = new XMLHttpRequest();
    var info = document.getElementById("info");
    var spinner = crearSpinner();

    info.innerHTML = "";

    activarMenu(document.getElementById("btnGetPersona"));

    xhr.onreadystatechange = function() //0 al 4 son los estados, 4 es el estado DONE
    {
        if(this.readyState == XMLHttpRequest.DONE) //XMLHttpRequest.DONE = 4
        {
            if(this.status == 200) // Estado OK
            {
                info.innerHTML = "";

                personas = JSON.parse(this.responseText); //Respuesta de texto del servidor (JSON), lo convierto a objeto

                crearTabla();
                crearFormulario();

                //document.getElementById("btnGetPersona").removeAttribute("disabled");
                //document.getElementById("btnAltaPersona").removeAttribute("disabled");
                document.getElementById("btnGetPersona").style.pointerEvents = "auto";
                document.getElementById("btnAltaPersona").style.pointerEvents = "auto";
            }
        }
        else
        {
            //document.getElementById("btnGetPersona").setAttribute("disabled", "");
            //document.getElementById("btnAltaPersona").setAttribute("disabled", "");
            //document.getElementById("btnEditarPersona").setAttribute("disabled", "");
            document.getElementById("btnGetPersona").style.pointerEvents = "none";
            document.getElementById("btnAltaPersona").style.pointerEvents = "none";
            document.getElementById("btnEditarPersona").style.pointerEvents = "none";
    
            info.appendChild(spinner);
        }
    };

    xhr.open("GET", "http://localhost:3000/traerPersonas", true); // true para que sea asincronico, debe ir el protocolo en forma explicita
    xhr.send(); //se envia la peticion al servidor
}

//Llamador usado por el evento dla opción de Agregar del formulario
function opcionAgregarPersona()
{
    agregarPersona(personaEditada());
}

//Crea un objeto JSON a partir de los datos del formulario
function personaEditada()
{
    var persona = {};

    for(var atributo in personas[0])
    {
        var atributoCapitalizado = atributo.charAt(0).toUpperCase() + atributo.slice(1).toLowerCase(); //Primer letra en mayuscula, resto minuscula
        persona[atributo] = document.getElementById("txt" + atributoCapitalizado).value;
    }

    return persona;
}

//Llama a la función altaPersona del servidor, pasándole el objeto que se quiere agregar por parámetro.
function agregarPersona(persona)
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
                crearDetalle(document.getElementById("tablaPersonas"), nuevaPersona);
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

    xhr.open('POST', 'http://localhost:3000/altaPersona', true); //abre la conexion( metodo , URL, que sea asincronico y no se quede esperando el retorno)
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(persona));

    // con POST LOS DATOS PASAR POR SEND
}

//Llamador usado por el evento dla opción de Borrar del formulario
function opcionBorrarPersona()
{
    borrarPersona(personaSeleccionada);
}

//Llama a la función bajaPersona del servidor, pasándole el objeto que se quiere eliminar por parámetro.
function borrarPersona(persona)
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
                    alert("Persona:\n\n" + personaToString(persona) + "\n\nfue borrada de la tabla");
                    borrarFilaSeleccionada(document.getElementById("tablaPersonas"));
                }
                else
                {
                    alert("Error al borrar persona. No se hicieron cambios");
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
    xhr.send(JSON.stringify(persona));

    // con POST LOS DATOS PASAR POR SEND
}

//Llamador usado por el evento dla opción de Modificar del formulario
function opcionModificarPersona()
{
    modificarPersona(personaSeleccionada, personaEditada());
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
                    alert("Persona:\n\n" + personaToString(personaPre) + "\n\nfue modificada a:\n\n" + personaToString(personaPost));
                    modificarFilaSeleccionada(personaPost);
                }
                else
                {
                    alert("Error al modificar persona. No se hicieron cambios");
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
function personaToString(persona)
{
    var texto = "";
    var retornoCarro = false;

    for(var atributo in persona)
    {
        if(retornoCarro) //Para que no haga retorno de carro en la primera línea
        {
            texto += "\n";
        }
        else
        {
            retornoCarro = true;
        }

        texto += atributo.toUpperCase() + ": " + persona[atributo];
    }

    return texto;
}

//Crea la tabla de personas en el div info
function crearTabla()
{
    var tablaPersonas = document.createElement("table");
    var puedeCrearDetalle = true; //Si no tengo elementos desde el servidor cambia a false.
    var div = document.getElementById("info");

    tablaPersonas.setAttribute("border", "1px");
    tablaPersonas.style.borderCollapse = "collapse"
    tablaPersonas.setAttribute("id", "tablaPersonas");
    tablaPersonas.setAttribute("class", "tablaPersonas");
    div.appendChild(tablaPersonas);

    if(typeof personas[0] != "object") //Si el servidor no trae nada creo la estructura vacía.
    {
        personas[0] = {"id":null,"nombre":null,"apellido":null,"edad":null};
        puedeCrearDetalle = false;
    }

    crearCabecera(tablaPersonas);

    if(puedeCrearDetalle)
    {
        crearDetalle(tablaPersonas, personas);
    }
}

//Crea el formulario de edición de personas en el div info.
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
    formulario.setAttribute("id", "formularioPersonas");
    formulario.style.display = "none";

    div.appendChild(formulario);

    formulario.appendChild(grupo);

    grupo.appendChild(leyenda);
    //grupo.appendChild(tablaFormulario);

    leyenda.textContent = "Persona";

    for(var atributo in personas[0])
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
    botonBorrar.addEventListener("click", opcionBorrarPersona, false);

    botonCancelar.setAttribute("type", "button");
    botonCancelar.setAttribute("id", "btnCancelar");
    botonCancelar.value = "Cancelar";
    botonCancelar.addEventListener("click", ocultarFormulario, false);

    grupo.appendChild(botonAgregar);
    grupo.appendChild(botonModificar);
    grupo.appendChild(botonBorrar);
    grupo.appendChild(botonCancelar);
}

//Crea la fila de cabecera, con tantas columnas como atributos posea la persona, en la tabla de personas.
function crearCabecera(tablaPersonas)
{
    var filaCabecera = document.createElement("tr");
    var columna;
    tablaPersonas.appendChild(filaCabecera);
    for(var atributo in personas[0])
    {
        columna = document.createElement("th");
        columna.textContent = atributo;
        filaCabecera.appendChild(columna);
    }
}

//Crea tantas fila de detalle en la tabla de personas como personas haya cargadas.
function crearDetalle(tablaPersonas, datos)
{
    for(var i = 0; i < datos.length; i++)
    {
        var filaDetalle = document.createElement("tr");
        var atributo;
        var columna;
        filaDetalle.addEventListener("click", seleccionarFila, false);
        tablaPersonas.appendChild(filaDetalle);

        for(atributo in datos[i])
        {
            columna = document.createElement("td");
            columna.setAttribute("class", atributo);
            columna.textContent = datos[i][atributo];
            filaDetalle.appendChild(columna);
        }
    }
}

//Cuando el usuario hace click en una fila de detalle de la tabla de personas,
//la función le setea, previo a blanquear si hay otra fila antes seleccionada, 
//el atributo id a la fila y carga la persona en el array de persona seleccionada.
function seleccionarFila()
{
    //document.getElementById("btnEditarPersona").removeAttribute("disabled");
    document.getElementById("btnEditarPersona").style.pointerEvents = "auto";
    blanquearFila();
    
    this.setAttribute("id", "filaSeleccionada");

    //Recorro las columnas de la fila seleccionada, guardando un atributo por columna en personaSeleccionada.
    for(var i = 0; i < this.childNodes.length; i++)
    {
        personaSeleccionada[this.childNodes[i].getAttribute("class")] = this.childNodes[i].textContent;
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

//Elimina de la tabla de personas la fila seleccionada por el usuario.
//Esta función la invoca la opción de borrar una persona del servidor,
//una vez devuelto el ok del mismo.
function borrarFilaSeleccionada(tabla)
{
    tabla.removeChild(document.getElementById("filaSeleccionada"));
}

//Modifica los datos de la fila seleccionada con los datos de la persona pasada por parámetro.
//Esta función la invoca la opción de modificar una persona del servidor,
//una vez devuelto el ok del mismo.
function modificarFilaSeleccionada(datos)
{
    var filaSeleccionada = document.getElementById("filaSeleccionada");

    //Recorro las columnas de la fila seleccionada, guardando un atributo por columna en personaSeleccionada.
    for(var i = 0; i < filaSeleccionada.childNodes.length; i++)
    {
        filaSeleccionada.childNodes[i].textContent = datos[filaSeleccionada.childNodes[i].getAttribute("class")];
    }
}

//Oculta la tabla de personas, y muestra el formulario invocando la función pertinente
//sin parámetro. Lo invoca la opción de Alta del menú
function altaPersona()
{
    activarMenu(document.getElementById("btnAltaPersona"));

    //document.getElementById("btnAltaPersona").setAttribute("disabled", "");
    //document.getElementById("btnEditarPersona").setAttribute("disabled", "");
    document.getElementById("btnAltaPersona").style.pointerEvents = "none";
    document.getElementById("btnEditarPersona").style.pointerEvents = "none";

    document.getElementById("tablaPersonas").style.display = "none";
    document.getElementById("formularioPersonas").style.display = "initial";

    mostrarFormulario();
}

//Oculta la tabla de personas, y muestra el formulario invocando la función pertinente
//pasándole por parámetro la persona que se quiere editar. Lo invoca la opción de Editar del menú
function editarPersona()
{
    activarMenu(document.getElementById("btnEditarPersona"));

    //document.getElementById("btnAltaPersona").setAttribute("disabled", "");
    //document.getElementById("btnEditarPersona").setAttribute("disabled", "");
    document.getElementById("btnAltaPersona").style.pointerEvents = "none";
    document.getElementById("btnEditarPersona").style.pointerEvents = "none";

    document.getElementById("tablaPersonas").style.display = "none";
    document.getElementById("formularioPersonas").style.display = "initial";

    mostrarFormulario(personaSeleccionada);
}

//Arma el formulario de edición de personas.
//Si no se le pasa parámetro asume que se trata de un alta, para ello muestra la opción
//que invoca la función de alta en el servidor y los cuadros de texto de los parámetros
//en blanco.
//Si se invoca con un objeto, la función asume modificación o baja de la persona que viene
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

    for(var atributo in personas[0])
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

//Oculta el formulario de edición y muestra la tabla de personas.
//Se blanquea cualquier fila que se haya previamente seleccionado.
function ocultarFormulario()
{
    activarMenu(document.getElementById("btnGetPersona"));

    //document.getElementById("btnAltaPersona").removeAttribute("disabled");
    //document.getElementById("btnEditarPersona").setAttribute("disabled", "");
    document.getElementById("btnAltaPersona").style.pointerEvents = "auto";
    document.getElementById("btnEditarPersona").style.pointerEvents = "none";

    blanquearFila();

    document.getElementById("tablaPersonas").style.display = "table";
    document.getElementById("formularioPersonas").style.display = "none";
}