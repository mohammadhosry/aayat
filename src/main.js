import { createApp } from "vue";
import Game from "./Game.vue";
import "../node_modules/@picocss/pico/css/pico.min.css";

const app = createApp(Game);
app.mount("#app");
