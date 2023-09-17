<template>
    <fieldset>
        <label for="switch">
            <input type="checkbox" id="switch" name="switch" role="switch" v-model="isDark" />
            الوضع الليلي
        </label>
    </fieldset>
    <hgroup>
        <h4>اجابات صحيحة: {{ score }}</h4>
        <h5 v-if="bestScore">افضل نتيجة: {{ bestScore }}</h5>
    </hgroup>

    <article>
        <div v-if="loading">
            <span aria-busy="true"></span>
        </div>
        <template v-else>
            <header>
                <p>
                    {{ ayahText }}
                    <span
                        v-show="audio"
                        @click="playAudio"
                        class="play-pause"
                        :style="{ backgroundPositionX: isPlaying ? '-30px' : 0 }"
                    ></span>
                </p>
                <audio v-if="audio" ref="audioPlayer">
                    <source :src="audio" type="audio/mpeg" />
                </audio>
                <!-- <select v-model="surah" class="ml-4 p-3">
                    <option v-for="sur in surahs" :key="sur.number" :value="sur.number">{{ sur.name }}</option>
                </select> -->
            </header>
            <div class="grid">
                <button
                    :class="`${reveal ? (surah === o.number ? 'contrast' : 'secondary') : ''} ${
                        reveal && selected === o.number
                            ? surah === o.number
                                ? 'animate-bounce'
                                : 'outline'
                            : ''
                    }`"
                    :style="{ order: o.order }"
                    @click="answer(o.number)"
                    v-for="o in options"
                    :key="o.number"
                    :disabled="reveal"
                >
                    {{ surahs[o.number].name }}
                </button>
            </div>
        </template>
        <!-- <button class="mt-8 bg-amber-100 border rounded px-2 py-1 text-xl disabled:bg-gray-400" :disabled="loading"
            @click="getRandomAyah">اية جديدة</button> -->
    </article>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useLocalStorage, useDark, useMediaControls } from "@vueuse/core";
import { rand as randomInt } from "@vueuse/shared";
import surahs from "./data/surahs.json";

interface Option {
    number: number;
    order: number;
}

const isDark = useDark({
    attribute: "data-theme",
    valueLight: "light",
});

const ayahText = ref("");
const surah = ref(2);
// const surahs = ref([])
const options = ref<Option[]>([]);
const loading = ref(false);
const reveal = ref(false);
// const isRight = ref(false)
const selected = ref<null | number>(null);
const score = ref(0);
const bestScore = useLocalStorage("bestScore", 0);
const audio = ref("");
const audioPlayer = ref<HTMLAudioElement | null>(null);
const { playing: isPlaying } = useMediaControls(audioPlayer, {
    src: audio,
});
// const isPlaying = ref(false);

// const max = computed(() => surahs[surah.value - 1]?.numberOfAyahs || 286)

const answer = (number: number) => {
    score.value += surah.value === number ? 1 : 0;
    if (score.value > bestScore.value) {
        bestScore.value = score.value;
    }
    selected.value = number;
    reveal.value = true;

    setTimeout(() => {
        // isRight.value = false
        reveal.value = false;
        getRandomAyah();
    }, 3600);
};

const fetchGet = async (url) => {
    return await fetch(`https://api.alquran.cloud/v1/${url}`).then((res) => res.json());
};

const getRandomAyah = async () => {
    loading.value = true;
    audio.value = "";
    surah.value = randomInt(1, 114);
    const ayah: number = randomInt(1, surahs[surah.value].numberOfAyahs);
    let url = `ayah/${surah.value}:${ayah}`;
    const {
        data: { text },
    } = await fetchGet(url);
    getAudio(`${url}/ar.abdulsamad`);
    loading.value = false;
    ayahText.value = text;
    getRandomOptions();
};

const getAudio = async (url) => {
    const { data } = await fetchGet(url);
    audio.value = data.audio;
};

const playAudio = () => {
    if (!isPlaying.value) {
        audioPlayer.value?.play();
    } else {
        audioPlayer.value?.pause();
    }
};

// const randomInt = (max, fromZero = false) => Math[fromZero ? 'floor' : 'ceil'](Math.random() * max)
// const randomInt = (max: number, min: number = 1) =>
//     Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomOptions = () => {
    options.value = [
        {
            number: surah.value,
            order: randomInt(1, 99),
        },
    ];

    for (let i = 0; i < 3; i++) {
        let rand: Option | null = null;

        do {
            rand = {
                number: randomInt(1, 114),
                order: randomInt(1, 99),
            };
        } while (options.value.find((o) => o.number === rand?.number));

        options.value.push(rand);
    }
};
// const getSurahs = async () => {
//     const { data } = await fetchGet(`surah`)
//     surahs.value = data
// }

onMounted(() => {
    // getSurahs()
    getRandomAyah();
    // console.log(audioPlayer)
});
</script>

<style sass>
/* @tailwind base;
@tailwind components;
@tailwind utilities;

body {
    width: 100vw;
} */
.play-pause {
    display: inline-block;
    background-image: url(/play-pause.png);
    background-size: cover;
    background-repeat: no-repeat;
    width: 30px;
    height: 30px;
    vertical-align: bottom;
    margin-right: 10px;
}
</style>
