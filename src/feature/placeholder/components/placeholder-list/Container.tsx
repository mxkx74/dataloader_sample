import { findAllPlaceholders } from "../../use-case/queries/interactor";
import { selectPlaceholderRows } from "../../adapter/selector";
import { PlaceholderListPresentational } from "./Presentational";

export async function PlaceholderListContainer() {
  const result = await findAllPlaceholders({});

  if (result.isErr()) {
    throw result.error;
  }

  const rows = selectPlaceholderRows(result.value);

  return <PlaceholderListPresentational rows={rows} />;
}
