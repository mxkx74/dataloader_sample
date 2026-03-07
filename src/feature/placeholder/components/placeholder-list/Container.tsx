import { findAllPlaceholders } from "../../use-case/queries/interactor";
import { selectPlaceholderRows } from "../../adapter/selector";
import { PlaceholderListPresentational } from "./Presentational";

export async function PlaceholderListContainer() {
  const data = await findAllPlaceholders({}, { throwOnError: true });
  const rows = selectPlaceholderRows(data);

  return <PlaceholderListPresentational rows={rows} />;
}
