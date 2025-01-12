import { Box, HStack } from "styled-system/jsx";

import { NextLink } from "@/components/Link/NextLink";
import type { VFileData } from "@/features/remark/frontmatter";
import { Link } from "@/park-ui/components/link";
import { toYYYYMMDD } from "@/utils/date";
import { PenIcon, RotateCwIcon } from "lucide-react";
import { getFileDate } from "./util";

export const FrontMatter = ({
	frontmatter,
}: Pick<VFileData, "frontmatter">) => {
	const fileDate = getFileDate({ frontmatter });
	if (!fileDate) return null;

	const { created, updated } = fileDate;

	const createdDateYMD = toYYYYMMDD((created || updated) as Date);
	const updateDateYMD = toYYYYMMDD((created || updated) as Date);

	return (
		<HStack justifyContent={"end"} fontSize={"0.8em"}>
			{createdDateYMD ? (
				<Box>
					<Link asChild color={"blue.10"} gap={1}>
						<NextLink href={`/search?query=created:${createdDateYMD}`}>
							<PenIcon />
							{createdDateYMD}
						</NextLink>
					</Link>
				</Box>
			) : null}
			{updateDateYMD ? (
				<Box>
					<Link asChild color={"blue.10"} gap={1}>
						<NextLink href={`/search?query=updated:${createdDateYMD}`}>
							<RotateCwIcon />
							{updateDateYMD}
						</NextLink>
					</Link>
				</Box>
			) : null}
		</HStack>
	);
};
