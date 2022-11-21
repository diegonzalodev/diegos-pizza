const containerCards = document.querySelector('.main .row');
const listaPizzas = document.querySelector('#list-pizzas');
const listaCarrito = document.querySelector('#list-cart');
const btnMostrarTotal = document.querySelector('#price-total');
const btnVaciarCarrito = document.querySelector('#empty-cart');

let pizzasSeleccionadas = [];

cargarEventListeners();
function cargarEventListeners() {
  listaPizzas.addEventListener('click', agregarPizza);

  listaCarrito.addEventListener('click', eliminarPizza);

  btnMostrarTotal.addEventListener('click', mostrarTotal);

  btnVaciarCarrito.addEventListener('click', vaciarCarrito);

  document.addEventListener('DOMContentLoaded', () => {
    AOS.init();
    obtenerDatos();

    pizzasSeleccionadas = JSON.parse(localStorage.getItem('listaPizzas')) || [];
    carritoHTML();
  });
}

function obtenerDatos() {
  const url = 'js/pizzas.json';
  fetch(url)
    .then((respuesta) => respuesta.json())
    .then((resultado) => cargarCards(resultado));
}

function cargarCards(object) {
  object.forEach((pizza, indice) => {
    containerCards.innerHTML += `
      <div class="col col-sm-2 col-md-3 col-sm my-4 d-flex justify-content-center align-items-center" style="width: 20rem;">
        <div id="card" class="card me-4" style="width: 25rem;">
          <div class="p-2">
            <img class="card-img-top img-fluid" src="${pizza.picture}" alt="Imagen Pizza">
          </div>
          <div class="card-body">
            <h5 class="card-title mb-4 fs-5 text-center">${pizza.name}</h5>
            <div class="d-flex justify-content-between align-items-center">
              <a href="#" class="btn btn-success w-50" data-id="${indice}">Añadir</a>
              <p class="card-text fs-2">$<strong>${pizza.price}</strong></p>
          </div>
        </div>
      </div>
    </div>`;
  });
}

function agregarPizza(e) {
  e.preventDefault();

  if(e.target.classList.contains('btn-success')) {
    const selectedPizza = e.target.parentElement.parentElement.parentElement;
    leerDatosPizza(selectedPizza);
    Swal.fire({
      width: '20rem',
      position: 'top-end',
      showConfirmButton: false,
      icon: 'success',
      text: 'Producto agregado correctamente',
      timer: 1000
    });
  }
}

function leerDatosPizza(producto) {
  const infoPizza = {
    id: producto.querySelector('a').getAttribute('data-id'),
    picture: producto.querySelector('img').src,
    name: producto.querySelector('h5').textContent,
    price: producto.querySelector('strong').textContent,
    quantity: 1,
  };

  const verificarPizza = pizzasSeleccionadas.some(pizza => pizza.id === infoPizza.id);

  if(verificarPizza) {
    const pizzas = pizzasSeleccionadas.map(pizza => {
      if (pizza.id === infoPizza.id) {
        pizza.quantity++;
        return pizza;
      } else {
        return pizza;
      }
    });
    pizzasSeleccionadas = [...pizzas];
  } else {
    pizzasSeleccionadas = [...pizzasSeleccionadas, infoPizza];
  }

  carritoHTML();
}

function eliminarPizza(e) {
  if(e.target.classList.contains('remove-pizza')) {
    const pizzaId = e.target.getAttribute('data-id');
    pizzasSeleccionadas = pizzasSeleccionadas.filter(pizza => pizza.id !== pizzaId);
    carritoHTML();
  }
}

function carritoHTML() {
  limpiarHTML();

  pizzasSeleccionadas.forEach(pizza => {
    const {id, name, price, picture, quantity} = pizza;
    const row = document.createElement('tr');
    row.innerHTML = `
    <td class="text-center">
      <img class="w-75" src="${picture}" alt="${name}">
    </td>
    <td class="text-center">${name}</td>
    <td class="text-center">${price}</td>
    <td class="text-center">${quantity}</td>
    <td class="text-center">
      <a class="remove-pizza" href="#" data-id="${id}">X</a>
    </td>
    `;

    listaCarrito.appendChild(row);
  });

  sincronizarLocalStorage();
}

function mostrarTotal() {
  if (pizzasSeleccionadas.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Carrito Vacio',
      text: 'No hay ninguna operación para realizar',
      showConfirmButton: false,
      timer: 2000
    });
  } else {
    const precioTotal = pizzasSeleccionadas.reduce((acc, pizza) => acc + pizza.quantity * pizza.price, 0);
    Swal.fire({
      title: "Precio total",
      text: `El total a pagar corresponde a $${precioTotal}`,
      confirmButtonText: "Continuar con la compra",
      showCancelButton: true
    }).then((result) => {
      if(result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Compra efectuada',
          text: 'Agradecemos su preferencia'
        });
        pizzasSeleccionadas = [];
        limpiarHTML();
        sincronizarLocalStorage();
      }
    })
  }
}

function vaciarCarrito() {
  if(pizzasSeleccionadas.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Carrito Vacio',
      text: 'No hay ningún producto para eliminar',
      showConfirmButton: false,
      timer: 2000
    })
  }else {
    pizzasSeleccionadas = [];
    limpiarHTML();
    sincronizarLocalStorage();
    Swal.fire({
      icon: 'success',
      title: 'Hecho',
      text: 'Se eliminaron todos los productos del carrito'
    });
  }
}

function sincronizarLocalStorage() {
  localStorage.setItem("listaPizzas", JSON.stringify(pizzasSeleccionadas));
}

function limpiarHTML() {
  listaCarrito.innerHTML = '';
}