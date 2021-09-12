<script>
import { addRow as addLayoutRow } from "../stores/layout.js";
</script>

<div class="menu">
    <ul class="list">
        <li class="list__item">
            <span class="label">Layout</span>
            <ul class="sublist">
                <li class="sublist__item">
                    <button>Save current as...</button>
                </li>
                <li class="sublist__item">
                    <button on:click={addLayoutRow}>Add row</button>
                </li>
            </ul>
        </li>
    </ul>
</div>

<style>

</style>
