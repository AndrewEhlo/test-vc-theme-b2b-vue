<template>
  <LandingPage>
    <component
      :is="Category"
      v-if="slugInfo?.entityInfo?.objectType === 'Category'"
      :category-id="slugInfo?.entityInfo?.objectId"
    />
    <component
      :is="Product"
      v-else-if="slugInfo?.entityInfo?.objectType === 'CatalogProduct'"
      :product-id="slugInfo?.entityInfo?.objectId"
    />

    <component :is="StaticPage" v-else-if="slugInfo?.contentItem?.type === 'page'" />

    <NotFound v-else-if="!loading" />
  </LandingPage>
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/core";
import { defineAsyncComponent, onBeforeUnmount, watchEffect } from "vue";
import { useNavigations } from "@/core/composables";
import { LandingPage } from "@/shared/builder-io";
import { useSlugInfo } from "@/shared/common";
import { useStaticPage } from "@/shared/static-content";
import NotFound from "@/pages/404.vue";

interface IProps {
  pathMatch?: string[];
}

const props = withDefaults(defineProps<IProps>(), {
  pathMatch: () => [],
});

const Category = defineAsyncComponent(() => import("@/pages/category.vue"));
const Product = defineAsyncComponent(() => import("@/pages/product.vue"));
const StaticPage = defineAsyncComponent(() => import("@/pages/static-page.vue"));

const { setMatchingRouteName } = useNavigations();

const { staticPage } = useStaticPage();

const seoUrl = computedEager(() => {
  // Because URL `/printers/` is an array of paths ["printers", ""], empty paths must be removed.
  const paths = props.pathMatch.filter(Boolean);
  return paths.join("/");
});

const { loading, slugInfo } = useSlugInfo(seoUrl);

onBeforeUnmount(() => {
  setMatchingRouteName("");
});

watchEffect(() => {
  let matchingRouteName = "";

  if (slugInfo.value?.contentItem?.type === "page") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    staticPage.value = JSON.parse(slugInfo.value.contentItem.content);
  }

  switch (slugInfo.value?.entityInfo?.objectType) {
    case "CatalogProduct":
      matchingRouteName = "Product";
      break;
    case "Category":
      matchingRouteName = "Category";
      break;
  }

  setMatchingRouteName(matchingRouteName);
});
</script>
