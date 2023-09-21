<template>
    <hgroup>
        <h4>اجابات صحيحة: {{ totalScore }}</h4>
        <!-- <h5 v-if="bestScore">افضل نتيجة: {{ bestScore }}</h5> -->
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
                    v-for="o in options"
                    :class="`${reveal && surah === o.number ? 'animate-bounce' : 'secondary'} ${
                        reveal && selected === o.number ? (surah === o.number ? '' : 'outline') : ''
                    }`"
                    :style="{ order: o.order }"
                    @click="!reveal && answer(o.number)"
                    :key="o.number"
                >
                    {{ surahs[o.number].name }}
                </button>
            </div>
        </template>
        <!-- <button class="mt-8 bg-amber-100 border rounded px-2 py-1 text-xl disabled:bg-gray-400" :disabled="loading"
            @click="getRandomAyah">اية جديدة</button> -->
    </article>
    <div class="grid">
        <div></div>
        <div v-if="reveal">
            <button :aria-busy="loading" @click="getRandomAyah">الاية التالية</button>
            <progress :value="progress" :max="progressMax"></progress>
        </div>
        <div></div>
    </div>
    <br />
    <details>
        <summary>إعدادات</summary>
        <fieldset>
            <label for="switch">
                <input type="checkbox" id="switch" name="switch" role="switch" v-model="isDark" />
                الوضع الليلي
            </label>
        </fieldset>
        <label for="selectedAudio">القارئ</label>
        <select id="selectedAudio" v-model="selectedAudio">
            <option v-for="(aud, index) in audios" :value="index">{{ aud.name }}</option>
        </select>
        <blockquote>تغيير اللإعدادات التالية يمحو كل النقاط</blockquote>
        <fieldset>
            <label for="switch">
                <input type="checkbox" id="switch" name="switch" role="switch" v-model="juz30" />
                جزء عم
            </label>
        </fieldset>
        <fieldset>
            <legend>عدد الخيارات</legend>
            <label>
                <input type="radio" v-model="optionsNumber" :value="3" />
                3
            </label>
            <label>
                <input type="radio" v-model="optionsNumber" :value="4" />
                4
            </label>
            <label>
                <input type="radio" v-model="optionsNumber" :value="5" />
                5
            </label>
        </fieldset>
    </details>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useLocalStorage, useDark, useMediaControls, useInterval } from "@vueuse/core";
import { rand as randomInt } from "@vueuse/shared";
import surahs from "./data/surahs.json";
import audios from "./data/audios.json";

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
// const score = ref(0);
// const bestScore = useLocalStorage("bestScore", 0);
const totalScore = useLocalStorage("totalScore", 0);
const juz30 = useLocalStorage("juz30", false);
const optionsNumber = useLocalStorage("optionsNumber", 4);
const audio = ref("");
const audioPlayer = ref<HTMLAudioElement | null>(null);
const selectedAudio = useLocalStorage("selectedAudio", 0);
const { playing: isPlaying } = useMediaControls(audioPlayer, {
    src: audio,
});
const progressMax = 30;
const {
    counter: progress,
    resume: resumeProgress,
    reset: resetProgress,
    pause: pauseProgress,
} = useInterval(100, {
    controls: true,
    immediate: false,
    callback(progress) {
        if (progress >= progressMax) {
            getRandomAyah();
        }
    },
});

// const max = computed(() => surahs[surah.value - 1]?.numberOfAyahs || 286)

const pauseAndReset = () => {
    pauseProgress();
    resetProgress();
};

const answer = (number: number) => {
    surah.value === number && totalScore.value++;

    // if (score.value > bestScore.value) {
    //     bestScore.value = score.value;
    // }

    selected.value = number;
    reveal.value = true;
    resumeProgress();
};

const fetchGet = async (url) => {
    return await fetch(`https://api.alquran.cloud/v1/${url}`).then((res) => res.json());
};

const getRandomAyah = async () => {
    loading.value = true;
    audio.value = "";
    reveal.value = false;
    pauseAndReset();
    surah.value = randomInt(juz30.value ? 78 : 1, 114);
    const ayah: number = randomInt(1, surahs[surah.value].numberOfAyahs);
    let url = `ayah/${surah.value}:${ayah}`;
    const {
        data: { text },
    } = await fetchGet(url);
    getAudio(`${url}/${audios[selectedAudio.value].identifier}`);
    loading.value = false;
    ayahText.value = text;
    getRandomOptions();
};

const getAudio = async (url: string) => {
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

    for (let i = 0; i < optionsNumber.value - 1; i++) {
        let rand: Option | null = null;

        do {
            rand = {
                number: randomInt(juz30.value ? 78 : 1, 114),
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

const resetAndGet = () => {
    getRandomAyah();
    totalScore.value = 0;
};

watch(juz30, resetAndGet);
watch(optionsNumber, resetAndGet);
watch(selectedAudio, getRandomAyah);

onMounted(() => {
    // getSurahs()
    getRandomAyah();
    // console.log(audioPlayer)
});
</script>

<style sass>
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

.animate-bounce {
    animation: bounce 1s infinite;
}

@keyframes bounce {
    0%,
    100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
        transform: none;
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
}
</style>
