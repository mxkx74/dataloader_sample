import { findAllPlaceholders } from "../../use-case/queries/interactor";
import { selectPlaceholderRows } from "../../adapter/selector";
import { PlaceholderListPresentational } from "./Presentational";

export async function PlaceholderListContainer() {
  const result = await findAllPlaceholders({}, { throwOnError: true });
  const rows = selectPlaceholderRows(result._unsafeUnwrap());

  return <PlaceholderListPresentational rows={rows} />;
}
