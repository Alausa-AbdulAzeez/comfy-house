const productsDOM = document.querySelector(".products-center");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const cartOverlay = document.querySelector(".cart-overlay");
const cartDOM = document.querySelector(".cart");
const cartTotal = document.querySelector(".cart-total");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartBtn = document.querySelector(".cart-btn");
const itemAmount = document.querySelector(".item-amount");

// cart
let cart = [];

// buttons
let buttonsDOM = [];

// getting the products

class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;

      products = products.map((product) => {
        const { fields, sys } = product;
        const { id } = sys;
        const { title, price } = fields;
        const image = fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    let result = "";
    products.map((product) => {
      const { title, price, id, image } = product;
      result += `
      <!--single product  -->
        <article class="product">
          <div class="img-container">
            <img
              src=${image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${id}>
              <i class="fas fa-shopping-cart"></i>
              add to bag
            </button>
          </div>
          <h3>${title}</h3>
          <h4>$${price}</h4>
        </article>

        <!--end of single product  -->
      `;
      return result;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.map((button) => {
      let id = button.dataset.id;

      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        // console.log(event);
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add product to the cart
        cart = [...cart, cartItem];
        // save cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        // show the cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const { id, title, price, image, amount } = item;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${image} alt="" />
            <div class="">
              <h4>${title}</h4>
              <h5>$${price}</h5>
              <span class="remove-item" data-id = ${id}>remove</span>
            </div>
            <div class="">
              <i class="fas fa-chevron-up" data-id = ${id}></i>
              <p class="item-amount">${amount}</p>
              <i class="fas fa-chevron-down "data-id = ${id}></i>
            </div>`;
    cartContent.appendChild(div);
    // console.log(cartContent);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);

    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.map((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        // console.log(removeItem.dataset.id);
        this.removeItem(id);
        console.log(
          cartContent.removeChild(removeItem.parentElement.parentElement)
        );
      } else if (e.target.classList.contains("fa-chevron-up")) {
        let addAmount = e.target;
        console.log(addAmount.nextElementSibling);
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (e.target.classList.contains("fa-chevron-down")) {
        let removeAmount = e.target;
        console.log(removeAmount.previousElementSibling);
        let id = removeAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount === 0) {
          this.removeItem(id);
          cartContent.removeChild(removeAmount.parentElement.parentElement);
        } else {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          removeAmount.previousElementSibling.innerText = tempItem.amount;
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class='fas fa-shopping-cart'></i>add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
  // class CartPopulate {
  //   PopulateCart(cart) {
  //     cart.map((Item) => productDOM.domToDisplay(Item));
  //   }
  // }
}

// local stoarge
class Storage {
  static saveProducts(item) {
    // console.log(item);
    localStorage.setItem("products", JSON.stringify(item));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart items")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // setup app
  ui.setupAPP();
  // get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});

// class Buttons {
//   static getButtons() {
//     const buttons = [...document.querySelectorAll(".bag-btn")];
//     buttons.map((button) => {
//       let id = button.dataset.id;

//       let inCart = cart.find((item) => item.id === id);
//       if (inCart) {
//         button.innerText = "In Cart";
//         button.disabled = true;
//       } else {
//         button.addEventListener("click", (event) => {
//           console.log(event);
//           event.target.innerText = "In Cart";
//           event.target.disabled = true;
//         });
//       }
//     });
//   }
// }

// document.addEventListener("DOMContentLoaded", () => {
//   const products = new Products();
//   const ui = new UI();

//   products
//     .getProducts()
//     .then((products) => {
//       ui.displayProducts(products);
//       Storage.saveProducts(products);
//     })
//     .then(() => Buttons.getButtons());
// });
// 0.25532, 0.27106;

// class Products {
//   async getProducts() {
//     try {
//       const response = await fetch("products.json");
//       let data = await response.json();
//       let products = data.items;
//       products = products.map((product) => {
//         const { fields, sys } = product;
//         const { id } = sys;
//         const { title, price } = fields;
//         const image = fields.image.fields.file.url;
//         return { id, title, price, image };
//       });
//       return products;
//     } catch (error) {
//       console.log(error);
//     }
//   }
// }

// class UI {
//   displayProducts(item) {
//     let items = ``;

//     item.map((good) => {
//       const { image, id, title, price } = good;
//       items += `
//     <article class="product">
//             <div class="img-container">
//               <img
//                 src=${image}
//                 alt="product"
//                 class="product-img"
//               />
//               <button class="bag-btn" data-id=${id}>
//                 <i class="fas fa-shopping-cart"></i>
//                 add to bag
//               </button>
//             </div>
//             <h3>${title}</h3>
//             <h4>$${price}</h4>
//           </article>
//     `;
//       return items;
//     });
//     productsDOM.innerHTML = items;
//   }
// }

// class Button {
//   getButtons() {
//     const buttons = [...document.querySelectorAll(".bag-btn")];
//     buttons.map((button, index) => {
//       button.addEventListener("click", (e) => {
//         let id = e.target.dataset.id;
//         let inCart = cart.find((index) => index === id);
//         if (inCart) {
//           console.log("in cart");
//         }
//         if (!inCart) {
//           button.innerText = "In Cart";
//           button.disabled = true;
//           let cartItem = { ...Storage.getProduct(id), amount: 1 };
//           cart = [...cart, cartItem];
// SAVE TO LOCAL STORAGE
// Storage.saveCart();
// ADD TO CART
// Cart.cartTotalDisplay(cart);
// console.log(Cart.cartTotalDisplay(cart));

// GET ELEMENT CLICKED
// productDOM.domToDisplay(cartItem);
// SHOW CART
// showCart.showCartItems(cartItem);
// SetCart.cartOnStartup(cart);
//         }
//       });
//     });
//   }
// }
// SHOW CART
// class showCart {
//   static showCartItems(cartItem) {
//     cartOverlay.classList.add("transparentBcg");
//     cartDOM.classList.add("showCart");
//   }
// }

// class SetCart {
//   cartOnStartup() {
// const cartOnLoad = JSON.parse(localStorage.getItem("cart items"));
// cart = Storage.getCart();
// console.log(cart);
// Cart.cartTotalDisplay(cart);
// console.log(Cart.cartTotalDisplay(cart));
// CartPopulate.PopulateCart(cart);
// console.log(CartPopulate.PopulateCart(cart));
//   }
// }
// class CartPopulate {
//   PopulateCart(cart) {
//     cart.map((Item) => productDOM.domToDisplay(Item));
//   }
// }

// GET ELEMENT CLICKED
// class productDOM {
//   static domToDisplay(cartItem) {
//     const { id, title, price, image, amount } = cartItem;
//     const div = document.createElement("div");
//     div.classList.add("cart-item");
//     div.innerHTML = `<img src=${image} alt="" />
//             <div class="">
//               <h4>${title}</h4>
//               <h5>$${price}</h5>
//               <span class="remove-item" data-id = ${id}>remove</span>
//             </div>
//             <div class="">
//               <i class="fas fa-chevron-up"></i>
//               <p class="item-amount">${amount}</p>
//               <i class="fas fa-chevron-down"></i>
//             </div>`;
//     cartContent.appendChild(div);
//     console.log(cartContent);
//   }
// }
// ADD TO CART
// class Cart {
//   static cartTotalDisplay(cart) {
//     let cartTotal = 0;
//     let tempTotal = 0;
//     cart.map((cartProduct) => {
//       tempTotal += cartProduct.price * cartProduct.amount;
//       cartTotal += cartProduct.amount;
//     });
//     cartTotalAmount.innerText = parseFloat(tempTotal.toFixed(2));
//     cartItems.innerText = cartTotal;
//   }
// }

// SAVE TO LOCAL STORAGE
// class Storage {
//   static saveProducts(item) {
// console.log(item);
//     localStorage.setItem("products", JSON.stringify(item));
//   }
//   static getProduct(id) {
//     let products = JSON.parse(localStorage.getItem("products"));
//     return products.find((product) => product.id === id);
//   }
//   static saveCart() {
//     localStorage.setItem("cart items", JSON.stringify(cart));
//   }
//   static getCart() {
//     return localStorage.getItem("cart items")
//       ? JSON.parse(localStorage.getItem("cart items"))
//       : [];
//   }
// }

// document.addEventListener("DOMContentLoaded", () => {
//   const products = new Products();
//   const ui = new UI();
//   const buttons = new Button();
//   const setCart = new SetCart();
//   setCart.cartOnStartup();

//   console.log(products);
//   products
//     .getProducts()
//     .then((item) => {
//       ui.displayProducts(item);
//       Storage.saveProducts(item);
//     })
//     .then(() => {
//       buttons.getButtons();
//     });
// });
