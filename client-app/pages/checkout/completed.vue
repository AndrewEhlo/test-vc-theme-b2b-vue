<template>
  <VcEmptyPage
    image="/static/images/order-completed.webp"
    mobile-image="/static/images/order-completed.webp"
    class="flex grow flex-col"
  >
    <template #title>
      <h1
        v-t="'pages.checkout_complete.title'"
        class="mb-3 text-center text-2xl font-bold uppercase lg:hidden lg:text-left"
      />
    </template>

    <template #description>
      <h1
        v-t="'pages.checkout_complete.title'"
        class="mb-8 hidden text-center text-3xl font-bold uppercase lg:block lg:text-left"
      />

      <div class="mb-10 flex flex-col gap-5 lg:flex-row">
        <VcIcon name="check-circle" :size="48" class="hidden text-[--color-success-500] lg:block" />

        <div class="max-w-md text-center text-19 lg:text-left">
          <strong v-t="{ path: 'pages.checkout_complete.subtitle', args: [placedOrder?.number] }" class="mb-4 block" />

          <span v-t="'pages.checkout_complete.text'" />

          <div class="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-4 lg:justify-start">
            <VcButton :to="{ name: 'OrderDetails', params: { orderId: placedOrder?.id } }" min-width="10rem">
              <VcIcon name="document-text" />

              <span>
                {{ $t("common.buttons.show_order") }}
              </span>
            </VcButton>

            <VcButton to="/" min-width="10rem">
              {{ $t("common.buttons.home") }}
            </VcButton>
          </div>
        </div>
      </div>
    </template>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { useCheckout } from "@/shared/checkout";

const { placedOrder } = useCheckout();
</script>
