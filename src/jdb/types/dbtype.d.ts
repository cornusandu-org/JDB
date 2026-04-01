type DBDataType = {
    tables: Array<{
        name: string,
        index: Map<string, IndexType>,
        records: Map<Hash256Type, any>
    }>
};
