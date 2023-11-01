<script setup>
import { onBeforeMount } from 'vue';
import { useActivityStore } from '../../store/activityStore';

const props = defineProps({
    type: { type: String, default: "" },
    limit: { type: null, default: null },
    enableViewAllBtn: { type: Boolean, default: false }
})

const { fetchActivityList } = useActivityStore()

onBeforeMount(() => {

})

const initialize = async () => {

}
</script>