<template>
<table>
    <tr>
        <td>
            <label><input type="checkbox" id="bday_use_last_business_day" name="bday_use_last_business_day" class="option-input" /></label>
        </td>
        <td>
            <label><span class="dims_label" @click="toggle_options">__MSG_Label_bday_use_last_business_day__</span></label>
        </td>
    </tr>
    <tr>
        <td>
            <label><input type="checkbox" id="bday_default_only" name="bday_default_only" class="option-input" /></label>
        </td>
        <td>
            <label><span class="dims_label" @click="toggle_options">__MSG_Label_bday_default_only__</span></label>
        </td>
    </tr>
</table>
</template>

<script setup>

</script>

<style scoped>

</style>