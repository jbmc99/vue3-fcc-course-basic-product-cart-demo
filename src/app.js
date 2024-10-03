//creamos la instancia principal de vue
let app = Vue.createApp({
  //aqui añadimos dos propiedades importantes
  data() {
    return {
      //showSidebar controla si el carrito (sidebar se muestra o no)
      showSidebar: false,
      //inventory es un array que contiene los productos disponibles
      inventory: [],
      //cart es un objeto que almacena los productos añadidos al carrito
      cart: {},
    };
  },
  computed: {
    // totalQuantity es un getter que calcula la cantidad total de productos en el carrito
    totalQuantity() {
      return Object.values(this.cart).reduce((acc, curr) => {
        return acc + curr;
      }, 0); // Proporcionar un valor inicial de 0
    },
  },

  methods: {
    //Añade un producto al carrito. name es el nombre del producto, 
    //index es su posición en el array inventory
    addToCart(name, index) {
      if (!this.cart[name]) this.cart[name] = 0;
      //Aumenta la cantidad del producto en el carrito
      this.cart[name] += this.inventory[index].quantity;
      //Resetea la cantidad del producto en el inventario a 0
      this.inventory[index].quantity = 0;
      console.log(this.cart);
    },
    //esta función es un booleano que controla si el componente de sidebar
    //se muestra o no en la página. Inicialmente está en false, por lo que el carrito está oculto
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },
    //esta función elimina un producto del carrito
    remove(name) {
      delete this.cart[name];
    },
  },
  async mounted() {
    //fetch es una función que hace solicitudes a un servidor
    //y devuelve una promesa que se resuelve con la respuesta
    //en este caso, estamos haciendo una solicitud a un
    //archivo JSON
    const res = await fetch("./food.json");
    //await detiene la ejecución del código hasta que la promesa devuelta por fetch()
    //se resuelva. En este caso, la promesa se resuelve cuando los datos de food.json
    //han sido descargados.
    const data = await res.json();
    //cuando los datos se han descargado, los guardamos en la propiedad inventory
    this.inventory = data;
  },
});

//vamos a convertir esto en un componente
app.component("sidebar", {
  //el componente sidebar recibe una propiedad llamada toggle
  //que es una función que se ejecuta cuando se hace click en el botón de cerrar
  props: ["toggle", "cart", "inventory", "remove"],
  methods: {
    //obtiene el precio del producto en base a su nombre
    getPrice(name) {
      const product = this.inventory.find((p) => {
        return p.name === name;
      });
      return product.price.USD;
    },
    calculateTotal() {
      //Calcula el total del carrito multiplicando la cantidad por precio de cada producto
      const total = Object.entries(this.cart).reduce((acc, curr, index) => {
        return acc + curr[1] * this.getPrice(curr[0]);
      }, 0); // Proporcionar un valor inicial de 0
      return total.toFixed(2);
    },
  },
  template: `
          <aside class="cart-container">
            <div class="cart">
              <h1 class="cart-title spread">
                <span>
                  Cart
                  <i class="icofont-cart-alt icofont-1x"></i>
                </span>
                <button @click="toggle" class="cart-close">&times;</button>
              </h1>

              <div class="cart-body">
                <table class="cart-table">
                  <thead>
                    <tr>
                      <th><span class="sr-only">Product Image</span></th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th><span class="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                  <!-- Itera sobre el objeto cart y muestra los productos en el carrito -->
                    <tr v-for="(quantity, key, i) in cart" :key="i">
                      <td><i class="icofont-carrot icofont-3x"></i></td>
                      <td>{{ key }}</td>
                      <td>\${{ getPrice(key) }}</td>
                      <td class="center">{{ quantity }}</td>
                      <td class="center">\${{ quantity * getPrice(key) }}</td>
                      <td class="center">
                        <button @click="remove(key)" class="btn btn-light cart-remove">
                          &times;
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              <!--Mensaje que se muestra si no hay productos en el carrito-->
                <p v-if="!Object.keys(cart).length" class="center"><em>No items in cart</em></p>
                <div v-else class="spread">
                  <span><strong>Total:</strong> \$ {{ calculateTotal() }}</span>
                  <button class="btn btn-light">Checkout</button>
                </div>
              </div>
            </div>
          </aside>
        `,
});

app.mount("#app");
