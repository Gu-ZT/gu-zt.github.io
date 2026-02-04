<script setup>
import {data as posts} from '../posts.data.ts';
import PostCard from './PostCard.vue';
import {onMounted} from 'vue';

onMounted(mounted);

function updateAnimationValues() {
  const card = document.querySelector('.post-card');
  if (!card) return;

  const PX_PER_SEC = 100;
  const SIZE_FACTOR = 1.4;

  const {width, height} = card.getBoundingClientRect();

  const filterHeight = height * SIZE_FACTOR;
  const durY = filterHeight / PX_PER_SEC;

  const animateDy1 = document.getElementById('animate-dy-1');
  const animateDy2 = document.getElementById('animate-dy-2');

  if (animateDy1) {
    animateDy1.setAttribute('values', `${filterHeight}; 0`);
    animateDy1.setAttribute('dur', `${durY}s`);
  }
  if (animateDy2) {
    animateDy2.setAttribute('values', `0; -${filterHeight}`);
    animateDy2.setAttribute('dur', `${durY}s`);
  }

  const filterWidth = width * SIZE_FACTOR;
  const durX = filterWidth / PX_PER_SEC;
  const animateDx1 = document.getElementById('animate-dx-1');
  const animateDx2 = document.getElementById('animate-dx-2');
  if (animateDx1) {
    animateDx1.setAttribute('values', `${filterWidth}; 0`);
    animateDx1.setAttribute('dur', `${durX}s`);
  }
  if (animateDx2) {
    animateDx2.setAttribute('values', `0; -${filterWidth}`);
    animateDx2.setAttribute('dur', `${durX}s`);
  }
}

function mounted() {
  const cardToObserve = document.querySelector('.post-list-card');
  if (!cardToObserve) return;
  const resizeObserve = new ResizeObserver(() => {
    updateAnimationValues();
  });
  updateAnimationValues();
  resizeObserve.observe(cardToObserve);
}
</script>

<template>
  <div class="post-list">
    <post-card v-for="post in posts"
               class="post-list-card"
               :key="post.url"
               :title="post.title"
               :date="post.date"
               :url="post.url"
               :tags="post.tags"
    />
    <svg width="0" height="0">
      <defs>
        <filter
            id="turbulent-displace"
            color="sRGB"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
        >
          <feTurbulence
              id="turbulence"
              baseFrequency="0.02"
              numOctaves="10"
              seed="1"
              result="verticalNoise"
          />
          <feOffset
              in="verticalNoise"
              result="animatedVertical_1"
          >
            <animate
                id="animate-dy-1"
                attributeName="dy"
                values="239; 0"
                dur="4s"
                repeatCount="indefinite"
            />
          </feOffset>
          <feOffset
              in="verticalNoise"
              result="animatedVertical_2"
          >
            <animate
                id="animate-dy-2"
                attributeName="dy"
                values="0; -239"
                dur="4s"
                repeatCount="indefinite"
            />
          </feOffset>
          <feComposite
              in="animatedVertical_1"
              in2="animatedVertical_2"
              operator="over"
              result="seamlessVerticalNoise"
          />
          <feTurbulence
              id="turbulence"
              baseFrequency="0.02"
              numOctaves="10"
              seed="2"
              result="horizontalNoise"
          />
          <feOffset
              in="horizontalNoise"
              result="animatedHorizontal_1"
          >
            <animate
                id="animate-dx-1"
                attributeName="dx"
                values="0; 780"
                dur="4s"
                repeatCount="indefinite"
            />
          </feOffset>
          <feOffset
              in="horizontalNoise"
              result="animatedHorizontal_2"
          >
            <animate
                id="animate-dx-2"
                attributeName="dx"
                values="-780; 0"
                dur="4s"
                repeatCount="indefinite"
            />
          </feOffset>
          <feComposite
              in="animatedHorizontal_1"
              in2="animatedHorizontal_2"
              operator="over"
              result="seamlessHorizontalNoise"
          />
          <feBlend
              in="seamlessVerticalNoise"
              in2="seamlessHorizontalNoise"
              mode="color-dodge"
              result="finalBlendedNoise"
          />
          <feDisplacementMap
              in="SourceGraphic"
              in2="finalBlendedNoise"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="B"
          />
        </filter>
      </defs>
    </svg>
  </div>
</template>

<style scoped>
.post-list {
  margin-top: 2rem;
}
</style>