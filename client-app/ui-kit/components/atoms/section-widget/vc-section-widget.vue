<template>
  <div class="vc-section-widget">
    <div
      :class="[
        'vc-section-widget__title',
        {
          'vc-section-widget__title--hide-mobile': hideMobileTitle || !title,
          'vc-section-widget__title--hide-desktop': hideDesktopTitle || !title,
        },
      ]"
    >
      <VcHexagonIcon :icon="icon" />

      <VcTypography variant="h3" weight="extrabold">
        {{ title }}
      </VcTypography>
    </div>

    <div class="vc-section-widget__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  hideMobileTitle: Boolean,
  hideDesktopTitle: Boolean,

  title: {
    type: String,
    default: "",
  },

  icon: {
    type: String,
    default: "",
  },
});
</script>

<style lang="scss">
.vc-section-widget {
  $hideMobileTitle: "";
  $hideDesktopTitle: "";

  @apply relative bg-[color:var(--color-white)];

  @media (min-width: theme("screens.lg")) {
    @apply border rounded shadow-md-x;
  }

  &:after {
    @apply content-[''] z-[1] absolute top-full w-full h-3
    bg-gradient-to-b from-[#f1f1f1];

    @media (min-width: theme("screens.lg")) {
      @apply content-none;
    }
  }

  &__title {
    @apply flex items-center gap-3 px-7 pt-6 pb-3;

    &--hide-mobile {
      $hideMobileTitle: &;

      @apply hidden lg:flex;
    }

    &--hide-desktop {
      $hideDesktopTitle: &;

      @apply lg:hidden;
    }
  }

  &__content {
    @apply px-7 pt-3 pb-7;

    @media (min-width: theme("screens.lg")) {
      @apply pb-6;
    }

    #{$hideMobileTitle} ~ & {
      @apply pt-7 lg:pt-3;
    }

    #{$hideDesktopTitle} ~ & {
      @media (min-width: theme("screens.lg")) {
        @apply pt-6;
      }
    }
  }
}
</style>