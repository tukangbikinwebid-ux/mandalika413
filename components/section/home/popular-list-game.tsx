"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  publicProductCategoriesService,
  PublicProductCategory,
} from "@/services/api/public-product-categories";
import { useApiCall } from "@/hooks";

/* =================== Types & helpers =================== */

type Item = { title: string; imgSrc: string; slug: string };
type TabKey = "topup" | `parent_${number}`;

type TabDef = { key: TabKey; label: string; parentId?: number };

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const DUMMY_IMG =
  "https://sbclbzad8s.ufs.sh/f/vI07edVR8nimBHyqimTrX8OM2IxYqlGKDH6TeJ5faC7mvZAn";

/* =================== UI Components =================== */

const PAGE_SIZE = 10;

function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[];
  active: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-4">
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={[
              "rounded-2xl px-5 py-3 text-base font-semibold transition-colors",
              "ring-1 ring-white/10 shadow-sm",
              isActive
                ? "bg-[#DC143C] text-white"
                : "bg-[#3A3F45] text-white/90 hover:bg-[#454A51]",
            ].join(" ")}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function GameCard({ title, imgSrc }: { title: string; imgSrc: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#2B2A2F] ring-1 ring-white/10 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04] hover:shadow-2xl hover:shadow-black/30 hover:ring-rose-500/50 cursor-pointer">
      <div className="relative aspect-[3/4] w-full rounded-2xl ring-1 ring-transparent transition duration-500 group-hover:ring-rose-500/40">
        <Image
          src={imgSrc || DUMMY_IMG}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-90" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 sm:p-4">
          <div className="relative overflow-hidden">
            <span className="absolute inset-0 bg-white/20 mix-blend-overlay opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100" />
            <h3 className="relative z-10 font-bold leading-tight text-white drop-shadow-sm text-base sm:text-lg opacity-0 translate-y-2 transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-hover:translate-y-0 [mask-image:linear-gradient(90deg,transparent,white_12%,white_88%,transparent)] [mask-size:200%_100%] [mask-position:left] group-hover:[mask-position:right]">
              {title}
            </h3>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl p-px transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]">
        <div
          className="absolute inset-0 rounded-2xl opacity-70 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(135deg, rgba(244,63,94,.35), rgba(244,63,94,.15))",
          }}
        />
      </div>
    </div>
  );
}

/* =================== Page =================== */

export default function PopularGridExplore() {
  const [active, setActive] = useState<TabKey>("topup");
  const [tabs, setTabs] = useState<TabDef[]>([
    { key: "topup", label: "Top Up Games" },
  ]);

  const [parents, setParents] = useState<PublicProductCategory[]>([]);
  const [subs, setSubs] = useState<PublicProductCategory[]>([]);

  const { data: parentRes, execute: fetchParents } = useApiCall(() =>
    publicProductCategoriesService.getProductCategories({
      page: 1,
      paginate: 100,
      is_parent: 1,
      status: 1,
    })
  );

  const { data: subRes, execute: fetchSubs } = useApiCall(() =>
    publicProductCategoriesService.getProductCategories({
      page: 1,
      paginate: 300,
      status: 1,
    })
  );

  useEffect(() => {
    fetchParents();
    fetchSubs();
  }, [fetchParents, fetchSubs]);

  useEffect(() => {
    if (parentRes?.data?.data) setParents(parentRes.data.data);
    if (subRes?.data?.data) setSubs(subRes.data.data);
  }, [parentRes, subRes]);

  // Build tabs dynamically from parent categories (exclude Games)
  useEffect(() => {
    if (!parents.length) return;

    const dynamicParents = parents.filter((p) => {
      const t = p.title.toLowerCase();
      return t !== "games" && t !== "game";
    });

    const dynamicTabs: TabDef[] = dynamicParents.map((p) => ({
      key: `parent_${p.id}`,
      label: p.title,
      parentId: p.id,
    }));

    setTabs([{ key: "topup", label: "Top Up Games" }, ...dynamicTabs]);

    // jika tab aktif bukan lagi di list (mis. data berubah), reset ke topup
    const allKeys = new Set<TabKey>([
      "topup",
      ...dynamicTabs.map((d) => d.key),
    ]);
    if (!allKeys.has(active)) setActive("topup");
  }, [parents]); // eslint-disable-line react-hooks/exhaustive-deps

  // Visible counter per tab (dependent on dynamic tabs)
  const [visibleByTab, setVisibleByTab] = useState<Record<string, number>>({});
  useEffect(() => {
    // init visibility for any new keys
    setVisibleByTab((prev) => {
      const next = { ...prev };
      tabs.forEach((t) => {
        if (next[t.key] == null) next[t.key] = PAGE_SIZE;
      });
      return next;
    });
  }, [tabs]);

  // Helper: filter by tab
  const items: Item[] = useMemo(() => {
    const byTitle = (s: string) => s.toLowerCase();
    let rows: PublicProductCategory[] = [];

    if (active === "topup") {
      const gamesParent = parents.find(
        (p) => byTitle(p.title) === "games" || byTitle(p.title) === "game"
      );
      rows = gamesParent
        ? subs.filter((c) => c.parent_id === gamesParent.id)
        : subs;
    } else {
      // parse parent id from key "parent_<id>"
      const idStr = active.split("_")[1];
      const pid = Number(idStr);
      if (!Number.isNaN(pid)) rows = subs.filter((c) => c.parent_id === pid);
    }

    const sorted = [...rows].sort((a, b) =>
      a.title.localeCompare(b.title, "id", { sensitivity: "base" })
    );

    return sorted.map((c) => ({
      title: c.title,
      imgSrc: c.image || DUMMY_IMG,
      slug: c.slug ?? toSlug(c.title),
    }));
  }, [active, parents, subs]);

  const visible = visibleByTab[active] ?? PAGE_SIZE;
  const data = useMemo(() => items.slice(0, visible), [items, visible]);
  const canLoadMore = visible < items.length;

  const onChangeTab = (k: TabKey) => setActive(k);

  const onLoadMore = () =>
    setVisibleByTab((s) => ({
      ...s,
      [active]: Math.min((s[active] ?? PAGE_SIZE) + PAGE_SIZE, items.length),
    }));

  return (
    <section className="w-full py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4">
        <Tabs tabs={tabs} active={active} onChange={onChangeTab} />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-5 lg:gap-6">
          {data.map((it) => (
            <Link
              key={`${active}-${it.slug}`}
              href={`/game/${it.slug}`}
              prefetch
            >
              <GameCard title={it.title} imgSrc={it.imgSrc} />
            </Link>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          {canLoadMore ? (
            <button
              onClick={onLoadMore}
              className="rounded-full bg-[#3A393F] px-5 py-2 text-sm font-medium text-white/90 ring-1 ring-white/10 shadow-sm transition hover:bg-[#45444b]"
            >
              Tampilkan Lainnya…
            </button>
          ) : (
            <button
              disabled
              className="cursor-not-allowed rounded-full bg-[#3A393F] px-5 py-2 text-sm font-medium text-white/60 ring-1 ring-white/10"
            >
              Sudah semua
            </button>
          )}
        </div>
      </div>
    </section>
  );
}