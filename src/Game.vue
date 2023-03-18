<template>
    <div dir="rtl">
        <p class="text-2xl text-right mb-6">اجابات صحيحة: {{ score }}</p>
        <div v-if="loading">
            <span class="inline-block animate-spin w-2 h-2">Q</span>
        </div>
        <template v-else>
            <p
                :style="{ cursor: audio ? 'pointer' : 'progress' }"
                @click="audioPlayer?.paused ? audioPlayer.play() : audioPlayer?.pause()"
            >
                {{ ayahText }}
            </p>
            <audio v-if="audio" ref="audioPlayer">
                <source :src="audio" type="audio/mpeg" />
            </audio>
            <!-- <select v-model="surah" class="ml-4 p-3">
                <option v-for="sur in surahs" :key="sur.number" :value="sur.number">{{ sur.name }}</option>
            </select> -->
            <div class="grid">
                <button
                    :class="`${
                        reveal
                            ? surah === o.number
                                ? 'contrast'
                                : 'secondary'
                            : ''
                    } ${
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
                >
                    {{ surahs[o.number].name }}
                </button>
            </div>
        </template>
        <!-- <button class="mt-8 bg-amber-100 border rounded px-2 py-1 text-xl disabled:bg-gray-400" :disabled="loading"
            @click="getRandomAyah">اية جديدة</button> -->
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import surahs from "./data/surahs.json";

interface Option {
    number: number;
    order: number;
}

const ayahText = ref("");
const surah = ref(2);
// const surahs = ref([])
const options = ref<Option[]>([]);
const loading = ref(false);
const reveal = ref(false);
// const isRight = ref(false)
const selected = ref<null | number>(null);
const score = ref(0);
const audio = ref(null);
const audioPlayer = ref<HTMLAudioElement | null>(null);

// const max = computed(() => surahs[surah.value - 1]?.numberOfAyahs || 286)

const answer = (number: number) => {
    score.value += surah.value === number ? 1 : 0;
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
    audio.value = null;
    surah.value = randomInt(114);
    const ayah: number = randomInt(surahs[surah.value].numberOfAyahs);
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
    // audioPlayer.play()
};

// const randomInt = (max, fromZero = false) => Math[fromZero ? 'floor' : 'ceil'](Math.random() * max)
const randomInt = (max: number, min: number = 1) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomOptions = () => {
    options.value = [
        {
            number: surah.value,
            order: randomInt(99),
        },
    ];

    for (let i = 0; i < 3; i++) {
        let rand: Option | null = null;

        do {
            rand = {
                number: randomInt(114),
                order: randomInt(99),
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
</style>
