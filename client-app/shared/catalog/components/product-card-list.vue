<template>
  <div
    class="flex items-center justify-between bg-white rounded border p-4 shadow-sm hover:shadow-lg cursor-pointer space-x-6"
  >
    <div class="flex flex-grow items-center">
      <!-- Product image -->
      <div class="border border-gray-100 w-20 h-20 flex-shrink-0 mr-4">
        <img
          :src="product.imgSrc || '/static/images/no-image.svg'"
          :alt="product.name"
          class="w-full h-full object-cover object-center"
        />
      </div>

      <div>
        <!-- Product title -->
        <router-link
          :to="`/catalog/${product.slug}`"
          class="text-cyan-700 font-extrabold text-sm mb-3 flex-grow line-clamp-2 overflow-hidden"
        >
          {{ product.name }}
        </router-link>

        <!-- Compare checkbox -->
        <label class="flex-grow hidden md:inline-flex items-center text-sm cursor-pointer">
          <input
            type="checkbox"
            class="form-tick appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm checked:bg-cyan-700 checked:border-transparent focus:outline-none cursor-pointer"
          />
          <span class="ml-2">Compare</span>
        </label>
      </div>
    </div>

    <!-- Product props -->
    <div class="hidden xl:block text-sm flex-shrink-0 w-20">
      <div class="font-bold text-xs">Item #</div>
      <div class="text-cyan-700">{{ product.code }}</div>
    </div>

    <div class="hidden xl:block text-sm flex-shrink-0 w-24">
      <div class="font-bold text-xs">Mfr. model #</div>
      <div class="text-cyan-700">-</div>
    </div>

    <!-- Product price -->
    <div class="text-sm flex-shrink-0 w-28">
      <div class="font-bold text-xs">Your price</div>
      <div class="">
        <span class="text-green-700 font-extrabold">{{ product.price?.actual?.formattedAmount }}</span> / each
      </div>
    </div>

    <!-- Card widget -->
    <div class="flex-shrink-0 w-48">
      <slot name="cart-handler"></slot>

      <div v-if="product.availabilityData?.isInStock" class="flex items-center text-green-700 text-xs mt-3">
        <div class="w-1.5 h-1.5 bg-green-700 rounded mr-1"></div>
        {{ product.availabilityData.availableQuantity }} in stock
      </div>
      <div v-else class="flex items-center text-red-500 text-xs mt-3">
        <div class="w-1.5 h-1.5 bg-red-500 rounded mr-1"></div>
        Out of stock
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { Product } from "@/core/api/graphql/types";

defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});
</script>