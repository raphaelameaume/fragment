<script>
import Row from "./Row.svelte";
import Column from "./Column.svelte";
import Module from "./Module.svelte";

let current = {
    rows: [
        [
            [
                "monitor1",
            ]
        ],
        [
            [
                "monitor1", "monitor2"
            ],
        ],
        [
            [
                "monitor1"
            ],
            [
                "monitor1"
            ],
            [
                "monitor1"
            ],
        ],
    ]
};

</script>

<div class="layout">
    <nav>
        <button>Add row</button>
    </nav>
    <div class="content">
        {#each current.rows as row}
            <Row>
                {#each row as col}
                    <Column>
                        {#each col as module}
                            <Module name={module}></Module>
                        {/each}
                    </Column>
                {/each}
            </Row>
        {/each}
    </div>
</div>

<style>
.layout {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
}

.content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

</style>
